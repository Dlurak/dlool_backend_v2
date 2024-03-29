import Elysia from "elysia";
import { getSchools } from "./get";
import { createSchool } from "./post";

export const schoolRouter = new Elysia({ prefix: "/school" })
	.use(getSchools)
	.use(createSchool);
