import { Configuration, Value } from '@itgorillaz/configify';
import { IsIn, IsInt, Max, Min } from 'class-validator';

export type LogLevel = 'error' | 'warn' | 'log' | 'debug' | 'verbose';

/**
 * Typed application configuration, loaded and validated at startup by configify.
 * Validation failures abort boot rather than surfacing as runtime errors later.
 */
@Configuration()
export class AppConfig {
  @Value('PORT', { parse: (v: string) => parseInt(v, 10), default: 3000 })
  @IsInt()
  @Min(1)
  @Max(65535)
  port: number;

  @Value('LOG_LEVEL', { default: 'log' })
  @IsIn(['error', 'warn', 'log', 'debug', 'verbose'])
  logLevel: LogLevel;
}
