import { Injectable, Logger } from '@nestjs/common';
import { evaluate } from '../../domain/evaluation/evaluate';
import { EvaluationInput } from '../../domain/evaluation/evaluation-input';
import { QuietHours } from '../../domain/quiet-hours/quiet-hours';
import { PreferencesRepository } from '../preferences/preferences.repository';
import { PoliciesRepository } from '../policies/policies.repository';
import { EvaluateRequestDto } from './dto/evaluate-request.dto';
import { EvaluateResponse } from './dto/evaluate-response.dto';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(
    private readonly preferences: PreferencesRepository,
    private readonly policies: PoliciesRepository,
  ) {}

  /**
   * Load all data the decision needs, run the pure engine, and map the result
   * to the API response. Unknown users simply have no override / quiet hours
   * and fall back to defaults.
   */
  async evaluate(req: EvaluateRequestDto): Promise<EvaluateResponse> {
    const { userId, notificationType, channel, region } = req;
    const datetime = new Date(req.datetime);

    const [userPreference, defaultEnabled, quietHoursRecord, hasMatchingPolicy] = await Promise.all([
      this.preferences.findUserPreference(userId, notificationType, channel),
      this.preferences.findDefault(notificationType, channel),
      this.preferences.getQuietHours(userId),
      this.policies.hasDenyPolicy(notificationType, channel, region),
    ]);

    const quietHours = quietHoursRecord
      ? new QuietHours(quietHoursRecord.startTime, quietHoursRecord.endTime, quietHoursRecord.timezone)
      : undefined;

    const input: EvaluationInput = {
      type: notificationType,
      channel,
      region,
      datetime,
      userPreference,
      defaultEnabled,
      quietHours,
      hasMatchingPolicy,
    };

    const decision = evaluate(input);

    const response: EvaluateResponse =
      decision.decision === 'deny'
        ? { decision: 'deny', reason: decision.reason }
        : { decision: 'allow' };

    this.logger.log(
      `evaluate_decision user=${userId} type=${notificationType} channel=${channel} region=${region} ` +
        `datetime=${req.datetime} decision=${response.decision}${response.reason ? ` reason=${response.reason}` : ''}`,
    );
    // metric: increment counter notifications_evaluated{decision=response.decision, reason=response.reason ?? 'none'}

    return response;
  }
}
