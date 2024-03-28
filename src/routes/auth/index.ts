import e from "@edgedb";
import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { passowrdAuthSecret } from "schemas/auth";
import { createToken } from "utils/auth/jwt";
import { isUsernameTaken } from "utils/db/users";
import { randomNumber } from "utils/random";
import { wait } from "utils/time";

export const router = new Elysia({ prefix: "/auth" })
	.group("/register", (app) =>
		app.use(HttpStatusCode()).post(
			"/password",
			async ({ body, set, httpStatus }) => {
				if (await isUsernameTaken(body.username)) {
					set.status = httpStatus.HTTP_400_BAD_REQUEST;
					return {
						status: "error",
						error: "Username already taken",
					};
				}

				const creationQuery = e.insert(e.User, {
					username: body.username,
					displayname: body.displayname,
					authmethod: e.Authmethod.Password,
					authsecret: { password: await Bun.password.hash(body.password) },
				});

				return creationQuery
					.run(client)
					.then((data) => ({
						status: "success",
						message: "User created successfully",
						data: {
							id: data.id,
							usernmae: body.username,
						},
					}))
					.catch((e) => {
						console.error(e);
						set.status = httpStatus.HTTP_500_INTERNAL_SERVER_ERROR;
						return {
							status: "error",
							error: "An error occurred while creating the user",
						};
					});
			},
			{
				body: t.Object({
					username: t.String({
						minLength: 1,
					}),
					displayname: t.String({
						minLength: 1,
					}),
					password: t.RegExp(
						/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/,
					),
				}),
			},
		),
	)
	.group("/refresh-token", (app) =>
		app.use(HttpStatusCode()).post(
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

				const expectedPwdHash = passowrdAuthSecret.safeParse(
					user[0].authsecret,
				);
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

				const { token, expiresIn } = createToken({
					username: body.username,
					type: "refresh",
				});

				return {
					status: "success",
					message: "Token generated successfully",
					data: { token, expiresIn },
				};
			},
			{
				body: t.Object({
					username: t.String({ minLength: 1 }),
					password: t.String({ minLength: 1 }),
				}),
			},
		),
	);
