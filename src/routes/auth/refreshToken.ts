import e from "@edgedb";
import {
	DATABASE_DELETE_FAILED,
	DATABASE_WRITE_FAILED,
	UNAUTHORIZED,
} from "constants/responses";
import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { auth } from "plugins/auth";
import { passowrdAuthSecret } from "schemas/auth";
import { createToken } from "utils/auth/jwt";
import { promiseResult } from "utils/errors";
import { randomNumber } from "utils/random";
import { responseBuilder } from "utils/response";
import { wait } from "utils/time";

export const refreshTokenRouter = new Elysia({ prefix: "/refresh-token" })
	.use(HttpStatusCode())
	.use(auth)
	.post(
		"/password",
		async ({ body, set, httpStatus }) => {
			const notMatchingReturn = responseBuilder("error", {
				error: "Username or password is incorrect",
			});

			const user = await e
				.select(e.User, (u) => ({
					authsecret: true,
					filter: e.op(u.username, "=", body.username),
				}))
				.run(client);

			if (user.length === 0) {
				// to prevent timing attacks, we wait a random amount of time
				await wait(randomNumber(90, 130));
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return notMatchingReturn;
			}

			const expectedPwdHash = passowrdAuthSecret.safeParse(user[0].authsecret);
			if (!expectedPwdHash.success) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return responseBuilder("error", {
					error: "An error occurred while verifying the user",
				});
			}

			const isPasswordCorrect = await Bun.password.verify(
				body.password,
				expectedPwdHash.data.password,
			);
			if (!isPasswordCorrect) {
				set.status = httpStatus.HTTP_401_UNAUTHORIZED;
				return notMatchingReturn;
			}

			const { token: tokenRefresh, expiresIn: expiresInRefresh } = createToken({
				username: body.username,
				type: "refresh",
			});

			const query = e.update(e.User, (u) => ({
				filter_single: e.op(u.username, "=", body.username),
				set: {
					tokens: {
						"+=": e.insert(e.RefreshToken, { token: tokenRefresh }),
					},
				},
			}));

			const result = await promiseResult(() => query.run(client));

			if (result.isError) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return DATABASE_WRITE_FAILED;
			}

			const { token: tokenAccess, expiresIn: expiresInAccess } = createToken({
				username: body.username,
				type: "access",
				createdBy: "login",
			});

			return responseBuilder("success", {
				message: "Token generated successfully",
				data: {
					refreshToken: { token: tokenRefresh, expiresIn: expiresInRefresh },
					accessToken: { token: tokenAccess, expiresIn: expiresInAccess },
				},
			});
		},
		{
			body: t.Object({
				username: t.String({ minLength: 1 }),
				password: t.String({ minLength: 1 }),
			}),
			detail: { tags: ["Auth"] },
		},
	)
	.delete("/all", async ({ auth, set, httpStatus }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}
		if (auth.createdBy !== "login") {
			set.status = httpStatus.HTTP_403_FORBIDDEN;
			return responseBuilder("error", {
				error:
					"Access token must be generated using log in and not a refresh token",
			});
		}

		const delQuery = e.count(
			e.delete(e.RefreshToken, (t) => ({
				filter: e.op(t["<tokens[is User]"].username, "=", auth.username),
			})),
		);

		const result = await promiseResult(() => delQuery.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}

		return responseBuilder("success", {
			message: "Logged out from all sessions",
			data: {
				sessionCount: result.data,
			},
		});
	})
	.delete("/:refreshToken", async ({ params, auth, set, httpStatus }) => {
		if (!auth.isAuthorized) {
			set.status = httpStatus.HTTP_401_UNAUTHORIZED;
			return UNAUTHORIZED;
		}

		const delQuery = e.delete(e.RefreshToken, (t) => ({
			filter_single: e.op(
				e.op(t["<tokens[is User]"].username, "=", auth.username),
				"and",
				e.op(t.token, "=", params.refreshToken),
			),
		}));
		const result = await promiseResult(() => delQuery.run(client));

		if (result.isError) {
			set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
			return DATABASE_DELETE_FAILED;
		}

		if (!result.data) {
			set.status = httpStatus.HTTP_404_NOT_FOUND;
			return responseBuilder("error", {
				error: "Could not find that refresh token",
			});
		}

		return responseBuilder("success", {
			message: "Deleted one refresh token successfully",
			data: null,
		});
	});
