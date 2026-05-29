/**
 * Delivery channels. String-literal union kept Prisma-free so the domain layer
 * has no infrastructure dependency. Values match the Prisma `Channel` enum, so
 * mapping at the repository boundary is a typed identity.
 */
export const CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'MESSENGER'] as const;

export type Channel = (typeof CHANNELS)[number];
