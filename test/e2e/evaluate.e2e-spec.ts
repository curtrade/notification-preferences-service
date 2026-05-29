import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp, uniqueUserId } from './create-test-app';

describe('Evaluate (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.userPreference.deleteMany({});
    await prisma.userQuietHours.deleteMany({});
    await app.close();
  });

  const evaluate = (body: object) => request(app.getHttpServer()).post('/evaluate').send(body);
  const setPrefs = (id: string, body: object) =>
    request(app.getHttpServer()).post(`/users/${id}/preferences`).send(body);

  it('scenario 4: marketing SMS in EU is blocked by global policy', async () => {
    const res = await evaluate({
      userId: uniqueUserId(),
      notificationType: 'MARKETING',
      channel: 'SMS',
      region: 'EU',
      datetime: '2026-05-21T12:00:00Z',
    }).expect(200);

    expect(res.body).toEqual({ decision: 'deny', reason: 'blocked_by_global_policy' });
  });

  it('scenario 3: marketing push during quiet hours is denied', async () => {
    const id = uniqueUserId();
    await setPrefs(id, {
      quietHours: { startTime: '22:00', endTime: '08:00', timezone: 'Europe/Berlin' },
    }).expect(201);

    const res = await evaluate({
      userId: id,
      notificationType: 'MARKETING',
      channel: 'PUSH',
      region: 'US',
      datetime: '2026-01-15T22:30:00Z', // 23:30 Berlin -> within window
    }).expect(200);

    expect(res.body).toEqual({ decision: 'deny', reason: 'quiet_hours' });
  });

  it('scenario 3: transactional notification during quiet hours is allowed (bypass)', async () => {
    const id = uniqueUserId();
    await setPrefs(id, {
      quietHours: { startTime: '22:00', endTime: '08:00', timezone: 'Europe/Berlin' },
    }).expect(201);

    const res = await evaluate({
      userId: id,
      notificationType: 'TRANSACTIONAL',
      channel: 'EMAIL',
      region: 'US',
      datetime: '2026-01-15T22:30:00Z',
    }).expect(200);

    expect(res.body).toEqual({ decision: 'allow' });
  });

  it('allows a default-on transactional email outside quiet hours', async () => {
    const res = await evaluate({
      userId: uniqueUserId(),
      notificationType: 'TRANSACTIONAL',
      channel: 'EMAIL',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    }).expect(200);

    expect(res.body).toEqual({ decision: 'allow' });
  });

  it('denies when the user has explicitly disabled the (type, channel)', async () => {
    const id = uniqueUserId();
    await setPrefs(id, {
      preferences: [{ notificationType: 'MARKETING', channel: 'PUSH', enabled: false }],
    }).expect(201);

    const res = await evaluate({
      userId: id,
      notificationType: 'MARKETING',
      channel: 'PUSH',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    }).expect(200);

    expect(res.body).toEqual({ decision: 'deny', reason: 'disabled_by_user_preference' });
  });

  it('denies a default-off type for an unknown user (disabled_by_default)', async () => {
    const res = await evaluate({
      userId: uniqueUserId(),
      notificationType: 'MARKETING',
      channel: 'EMAIL',
      region: 'US',
      datetime: '2026-05-21T12:00:00Z',
    }).expect(200);

    expect(res.body).toEqual({ decision: 'deny', reason: 'disabled_by_default' });
  });

  it('rejects an invalid datetime with 400', async () => {
    await evaluate({
      userId: uniqueUserId(),
      notificationType: 'MARKETING',
      channel: 'EMAIL',
      region: 'US',
      datetime: 'not-a-date',
    }).expect(400);
  });
});
