import Elysia from "elysia";
import { createTag } from "./create";
import { listTags } from "./list";

export const tagRouter = new Elysia({ prefix: "/tags" })
	.use(createTag)
	.use(listTags);
