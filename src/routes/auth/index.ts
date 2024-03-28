import { Elysia } from "elysia";
import { refreshTokenRouter } from "./refreshToken";
import { registerRouter } from "./register";

export const router = new Elysia({ prefix: "/auth" })
	.use(registerRouter)
	.use(refreshTokenRouter);
