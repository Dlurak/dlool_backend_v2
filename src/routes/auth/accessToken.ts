import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { createToken, verifyToken } from "utils/auth/jwt";
import { isRefreshTokenAccociatedWithUser } from "utils/db/refreshToken";
import { responseBuilder } from "utils/response";

export const accessTokenRouter = new Elysia({ prefix: "/access-token" })
	.use(HttpStatusCode())
	.post(
		"/",
		async ({ body, set, httpStatus }) => {
			const { isValid, payload } = verifyToken(body.refreshToken);
			if (!isValid || payload === null || payload.type !== "refresh") {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return responseBuilder("error", {
					error: "Invalid token",
				});
			}

			const isFullyValid = await isRefreshTokenAccociatedWithUser(
				body.refreshToken,
				payload.username,
			);
			if (!isFullyValid) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return responseBuilder("error", {
					error: "Invalid token",
				});
			}

			const { token, expiresIn } = createToken({
				type: "access",
				username: payload.username,
				createdBy: "refresh",
			});

			return responseBuilder("success", {
				message: "Token generated successfully",
				data: { token, expiresIn },
			});
		},
		{
			body: t.Object({
				refreshToken: t.String({ minLength: 1 }),
			}),
			detail: { tags: ["Auth"] },
		},
	);
