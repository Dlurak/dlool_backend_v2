import Elysia from "elysia";
import { createTag } from "./create";
import { deleteTag } from "./delete";
import { listTags } from "./list";

export const tagRouter = new Elysia({ prefix: "/tags" })
	.use(createTag)
	.use(deleteTag)
	.use(listTags);
