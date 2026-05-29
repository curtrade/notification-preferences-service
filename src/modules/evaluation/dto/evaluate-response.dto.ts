import { DenyReason } from '../../../domain/types/decision';

export interface EvaluateResponse {
  decision: 'allow' | 'deny';
  /** Present only when decision is "deny". */
  reason?: DenyReason;
}
