import { HALF_YEAR, QUARTER_HOUR } from "constants/time";
import { sign, verify } from "jsonwebtoken";
import { envVars } from "utils/env";
import { z } from "zod";

const accessTokenPayloadSchema = z.object({
	username: z.string(),
	type: z.literal("access"),
	createdBy: z.union([z.literal("login"), z.literal("refresh")]),
});
const refreshTokenPayloadSchema = z.object({
	username: z.string(),
	type: z.literal("refresh"),
});

const jwtPayloadSchema = z.union([
	accessTokenPayloadSchema,
	refreshTokenPayloadSchema,
]);
type JwtPayload = z.infer<typeof jwtPayloadSchema>;

export const createToken = (payload: JwtPayload, expiresIn?: number) => {
	const secret = envVars().JWT_SECRET;

	const expiresSeconds =
		expiresIn ?? (payload.type === "refresh" ? HALF_YEAR : QUARTER_HOUR);

	return {
		token: sign(payload, secret, { expiresIn: expiresSeconds }),
		expiresIn: expiresSeconds,
	};
};

export const verifyToken = (token: string) => {
	try {
		const secret = envVars().JWT_SECRET;
		const verified = verify(token, secret);
		const payload = jwtPayloadSchema.parse(verified);

		return {
			isValid: true,
			payload,
		} as const;
	} catch (error) {
		return {
			isValid: false,
			payload: null,
		} as const;
	}
};
