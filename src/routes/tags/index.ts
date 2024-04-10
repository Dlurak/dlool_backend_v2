import Elysia from "elysia";
import { createTag } from "./create";
import { deleteTag } from "./delete";
import { listTags } from "./list";
import { updateTag } from "./update";

export const tagRouter = new Elysia({ prefix: "/tags" })
	.use(createTag)
	.use(listTags)
	.use(updateTag)
	.use(deleteTag);
