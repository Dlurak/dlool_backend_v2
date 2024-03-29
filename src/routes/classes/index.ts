import Elysia from "elysia";
import { createClass } from "./create";
import { getClass } from "./get";

export const classRouter = new Elysia({ prefix: "/classes" })
	.use(getClass)
	.use(createClass);
