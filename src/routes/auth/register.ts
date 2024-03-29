import e from "@edgedb";
import { Elysia, t } from "elysia";
import { HttpStatusCode } from "elysia-http-status-code";
import { client } from "index";
import { isUsernameTaken } from "utils/db/users";

export const registerRouter = new Elysia({ prefix: "/register" })
	.use(HttpStatusCode())
	.post(
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
				.then((data) => {
					set.status = httpStatus.HTTP_201_CREATED;
					return {
						status: "success",
						message: "User created successfully",
						data: {
							id: data.id,
							usernmae: body.username,
						},
					};
				})
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
					description: "The username must be unique and will be used to login",
				}),
				displayname: t.String({
					minLength: 1,
					description:
						"The display name will be shown to other users and does not need to be unique",
				}),
				password: t.String({
					minLength: 8,
					description:
						"Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character",
					pattern:
						"^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$",
				}),
				// t.RegExp(),
			}),
			detail: { tags: ["Auth"] },
		},
	);
