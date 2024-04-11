import Elysia from "elysia";
import { createNote } from "./create";
import { deleteNote } from "./delete";
import { listNotes } from "./list";
import { updateNote } from "./update";

export const noteRouter = new Elysia({ prefix: "/notes" })
	.use(createNote)
	.use(deleteNote)
	.use(updateNote)
	.use(listNotes);
