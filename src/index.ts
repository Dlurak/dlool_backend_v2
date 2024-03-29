import { swagger } from "@elysiajs/swagger";
import { VERSION } from "constants/general";
import { Elysia } from "elysia";
import { accessTokenRouter } from "routes/auth/accessToken";
import { refreshTokenRouter } from "routes/auth/refreshToken";
import { registerRouter } from "routes/auth/register";
import { userInfoRouter } from "routes/user/info";
import { edgedb } from "../dbschema/edgeql-js/imports";

export const client = edgedb.createClient();

const app = new Elysia()
	.use(
		swagger({
			documentation: {
				info: {
					title: "Dlool API",
					license: {
						name: "GPL-3.0",
						url: "https://www.gnu.org/licenses/gpl-3.0.html",
					},
					version: VERSION,
				},
				externalDocs: {
					description:
						"The Dlool documentation for general information and usage of the frontend.",
					url: "https://dlool.me/documentation",
				},
				tags: [
					{ name: "App", description: "General app information" },
					{ name: "Auth", description: "Authentication endpoints" },
					{ name: "User", description: "User information endpoints" },
				],
			},
		}),
	)
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
