import Elysia from "elysia";
import { createJoinRequest } from "./create";

export const moderationRouter = new Elysia({ prefix: "/mod" }).use(
	createJoinRequest,
);
