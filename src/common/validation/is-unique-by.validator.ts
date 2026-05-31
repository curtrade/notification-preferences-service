import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Array-level validator: every element must be unique by the composite of the
 * given property names. Rejects e.g. duplicate (notificationType, channel)
 * toggles in one request, where overlapping upserts would make the final
 * persisted state depend on element order.
 *
 * Shape checks (is-array, per-element validation) are left to @IsArray /
 * @ValidateNested; this decorator only inspects uniqueness.
 */
export function IsUniqueBy<T>(keys: (keyof T)[], validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isUniqueBy',
      target: object.constructor,
      propertyName,
      constraints: [keys],
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (!Array.isArray(value)) {
            return true;
          }
          const seen = new Set<string>();
          for (const item of value) {
            if (item === null || typeof item !== 'object') {
              continue;
            }
            const record = item as Record<string, unknown>;
            const composite = keys.map((k) => JSON.stringify(record[k as string])).join('|');
            if (seen.has(composite)) {
              return false;
            }
            seen.add(composite);
          }
          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          const [composite] = args.constraints as [(keyof T)[]];
          return `${args.property} must be unique by (${composite.join(', ')})`;
        },
      },
    });
  };
}
