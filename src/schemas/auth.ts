import { z } from 'zod'

export const authSecret = z.object({
	password: z.optional(z.string()),
});
export type AuthSecret = z.infer<typeof authSecret>;

export const passowrdAuthSecret = z.object({
	password: z.string(),
});
