import { swagger } from "@elysiajs/swagger";
import { DOCUMENTATION_OPTIONS } from "constants/documentation";
import { VERSION } from "constants/general";
import { Elysia } from "elysia";
import { assignmentsRouter } from "routes/assignments";
import { accessTokenRouter } from "routes/auth/accessToken";
import { refreshTokenRouter } from "routes/auth/refreshToken";
import { registerRouter } from "routes/auth/register";
import { calendarRouter } from "routes/calendar";
import { classRouter } from "routes/classes";
import { moderationRouter } from "routes/moderation";
import { schoolRouter } from "routes/school";
import { tagRouter } from "routes/tags";
import { deleteUser } from "routes/user/delete";
import { userInfoRouter } from "routes/user/info";
import { changeUserDetailsRouter } from "routes/user/settings";
import { edgedb } from "../dbschema/edgeql-js/imports";

export const client = edgedb.createClient();

const app = new Elysia()
	.use(swagger(DOCUMENTATION_OPTIONS))
	.use(schoolRouter)
	.use(classRouter)
	.use(moderationRouter)
	.use(assignmentsRouter)
	.use(calendarRouter)
	.use(tagRouter)
	.get(
		"/",
		() => ({
			name: "Dlool",
			isDlool: true,
			version: VERSION,
		}),
		{
			detail: {
				tags: ["App"],
			},
		},
	)
	.group("/auth", (app) =>
		app.use(registerRouter).use(refreshTokenRouter).use(accessTokenRouter),
	)
	.group("/user", (app) =>
		app
			.use(userInfoRouter)
			.group("/me", (app) => app.use(changeUserDetailsRouter).use(deleteUser)),
	)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
