import { Elysia } from "elysia";
import { edgedb } from "../dbschema/edgeql-js/imports";
import { router } from "./routes/auth";

export const client = edgedb.createClient();

const app = new Elysia()
	.use(router)
	.get("/", () => ({
		name: "Dlool",
		isDlool: true,
		version: "a2.0.0",
	}))
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
