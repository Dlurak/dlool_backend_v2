import Elysia from "elysia";
import { createAssignment } from "./create";

export const assignmentsRouter = new Elysia({ prefix: "/assignments" }).use(
	createAssignment,
);
