/**
 * Coarse geographic regions used by global policies. Values match the Prisma
 * `Region` enum.
 */
export const REGIONS = ['EU', 'US', 'APAC', 'OTHER'] as const;

export type Region = (typeof REGIONS)[number];
