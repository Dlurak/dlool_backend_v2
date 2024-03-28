import { Elysia } from "elysia";
import { accessTokenRouter } from "routes/auth/accessToken";
import { refreshTokenRouter } from "routes/auth/refreshToken";
import { registerRouter } from "routes/auth/register";
import { edgedb } from "../dbschema/edgeql-js/imports";

export const client = edgedb.createClient();

const app = new Elysia()
	.get("/", () => ({
		name: "Dlool",
		isDlool: true,
		version: "a2.0.0",
	}))
	.group("/auth", (app) =>
		app.use(registerRouter).use(refreshTokenRouter).use(accessTokenRouter),
	)
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
