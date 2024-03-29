import e from "@edgedb";
import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { passowrdAuthSecret } from "schemas/auth";
import { createToken } from "utils/auth/jwt";
import { randomNumber } from "utils/random";
import { responseBuilder } from "utils/response";
import { wait } from "utils/time";

export const refreshTokenRouter = new Elysia({ prefix: "/refresh-token" })
	.use(HttpStatusCode())
	.post(
		"/password",
		async ({ body, set, httpStatus }) => {
			const notMatchingReturn = {
				status: "error",
				error: "Username or password is incorrect",
			};

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
				return {
					status: "error",
					error: "An error occurred while verifying the user",
				};
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

			const query = e.update(e.User, () => ({
				filter: e.op(e.User.username, "=", body.username),
				set: {
					tokens: {
						"+=": e.insert(e.RefreshToken, { token: tokenRefresh }),
					},
				},
			}));

			const result = await query.run(client).catch(() =>
				responseBuilder("error", {
					error: "An error occurred while updating the user",
				}),
			);

			// a positive result is a array
			if (!Array.isArray(result)) {
				set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
				return result;
			}

			const { token: tokenAccess, expiresIn: expiresInAccess } = createToken({
				username: body.username,
				type: "access",
				createdBy: "login",
			});

			return {
				status: "success",
				message: "Token generated successfully",
				data: {
					refreshToken: { token: tokenRefresh, expiresIn: expiresInRefresh },
					accessToken: { token: tokenAccess, expiresIn: expiresInAccess },
				},
			};
		},
		{
			body: t.Object({
				username: t.String({ minLength: 1 }),
				password: t.String({ minLength: 1 }),
			}),
			detail: { tags: ["Auth"] },
		},
	);
