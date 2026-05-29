import { registerDecorator, ValidationOptions } from 'class-validator';
import { IANAZone } from 'luxon';

/**
 * class-validator decorator asserting that a value is a valid IANA timezone
 * (e.g. "Europe/Berlin"). Backed by Luxon's zone database.
 */
export function IsTimeZone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isTimeZone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && IANAZone.isValidZone(value);
        },
        defaultMessage(): string {
          return '$property must be a valid IANA timezone (e.g. Europe/Berlin)';
        },
      },
    });
  };
}
