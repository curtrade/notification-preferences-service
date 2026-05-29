import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp, uniqueUserId } from './create-test-app';

describe('Preferences (e2e)', () => {
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

  const get = (id: string) => request(app.getHttpServer()).get(`/users/${id}/preferences`);
  const post = (id: string, body: object) =>
    request(app.getHttpServer()).post(`/users/${id}/preferences`).send(body);

  type Pref = { notificationType: string; channel: string; enabled: boolean; source: string };
  const pick = (prefs: Pref[], type: string, channel: string): Pref | undefined =>
    prefs.find((p) => p.notificationType === type && p.channel === channel);

  it('scenario 1: a new user gets defaults (transactional_email on, marketing_email off)', async () => {
    const id = uniqueUserId();
    const res = await get(id).expect(200);

    expect(pick(res.body.preferences, 'TRANSACTIONAL', 'EMAIL')).toMatchObject({
      enabled: true,
      source: 'default',
    });
    expect(pick(res.body.preferences, 'MARKETING', 'EMAIL')).toMatchObject({
      enabled: false,
      source: 'default',
    });
    expect(res.body.quietHours).toBeNull();
  });

  it('scenario 2: disabling marketing email reflects in GET; transactional stays enabled', async () => {
    const id = uniqueUserId();
    await post(id, {
      preferences: [{ notificationType: 'MARKETING', channel: 'EMAIL', enabled: false }],
    }).expect(201);

    const res = await get(id).expect(200);
    expect(pick(res.body.preferences, 'MARKETING', 'EMAIL')).toMatchObject({
      enabled: false,
      source: 'user',
    });
    expect(pick(res.body.preferences, 'TRANSACTIONAL', 'EMAIL')).toMatchObject({ enabled: true });
  });

  it('scenario 5: applying the same change twice is idempotent (one row, identical state)', async () => {
    const id = uniqueUserId();
    const body = {
      preferences: [{ notificationType: 'MARKETING', channel: 'EMAIL', enabled: false }],
    };

    const first = await post(id, body).expect(201);
    const second = await post(id, body).expect(201);

    expect(second.body.preferences).toEqual(first.body.preferences);
    const count = await prisma.userPreference.count({ where: { userId: id } });
    expect(count).toBe(1);
  });

  it('sets quiet hours and returns them on GET', async () => {
    const id = uniqueUserId();
    await post(id, {
      quietHours: { startTime: '22:00', endTime: '08:00', timezone: 'Europe/Berlin' },
    }).expect(201);

    const res = await get(id).expect(200);
    expect(res.body.quietHours).toEqual({
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Europe/Berlin',
    });
  });

  it('rejects an unknown notification type with 400', async () => {
    const id = uniqueUserId();
    await post(id, {
      preferences: [{ notificationType: 'NOPE', channel: 'EMAIL', enabled: false }],
    }).expect(400);
  });

  it('rejects a malformed quiet-hours time with 400', async () => {
    const id = uniqueUserId();
    await post(id, {
      quietHours: { startTime: '25:00', endTime: '08:00', timezone: 'Europe/Berlin' },
    }).expect(400);
  });

  it('rejects an invalid timezone with 400', async () => {
    const id = uniqueUserId();
    await post(id, {
      quietHours: { startTime: '22:00', endTime: '08:00', timezone: 'Not/AZone' },
    }).expect(400);
  });
});
