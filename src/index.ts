import { swagger } from "@elysiajs/swagger";
import { DOCUMENTATION_OPTIONS } from "constants/documentation";
import { VERSION } from "constants/general";
import { Elysia } from "elysia";
import { accessTokenRouter } from "routes/auth/accessToken";
import { refreshTokenRouter } from "routes/auth/refreshToken";
import { registerRouter } from "routes/auth/register";
import { classRouter } from "routes/classes";
import { schoolRouter } from "routes/school";
import { userInfoRouter } from "routes/user/info";
import { edgedb } from "../dbschema/edgeql-js/imports";

export const client = edgedb.createClient();

const app = new Elysia()
	.use(swagger(DOCUMENTATION_OPTIONS))
	.use(schoolRouter)
	.use(classRouter)
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
	.group("/user", (app) => app.use(userInfoRouter))
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
