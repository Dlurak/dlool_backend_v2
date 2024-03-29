import { bearer } from "@elysiajs/bearer";
import Elysia from "elysia";
import { verifyToken } from "utils/auth/jwt";

type IsAuthorized = {
	isAuthorized: true;
	username: string;
	createdBy: "login" | "refresh";
};
type IsNotAuthorized = {
	isAuthorized: false;
};

type Auth = IsAuthorized | IsNotAuthorized;

/**
 * Middleware to check if the user is authorized
 */
export const auth = new Elysia({
	name: "auth-plugin",
})
	.use(bearer())
	.derive({ as: "global" }, ({ bearer }) => ({
		get auth(): Auth {
			const unauthorizedRes = { isAuthorized: false } as const;

			if (!bearer) return unauthorizedRes;

			const { payload, isValid } = verifyToken(bearer);
			if (!isValid) return unauthorizedRes;
			if (!(payload.type === "access")) return unauthorizedRes;

			return {
				isAuthorized: true,
				username: payload.username,
				createdBy: payload.createdBy,
			};
		},
	}));
