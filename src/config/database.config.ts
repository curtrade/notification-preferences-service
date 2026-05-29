import { Configuration, Value } from '@itgorillaz/configify';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Database configuration. Prisma reads DATABASE_URL directly from the
 * environment, but we surface it here so config validation fails fast at
 * boot if it is missing or empty.
 */
@Configuration()
export class DatabaseConfig {
  @Value('DATABASE_URL')
  @IsString()
  @IsNotEmpty()
  url: string;
}
