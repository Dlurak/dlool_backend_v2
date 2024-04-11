import Elysia from "elysia";
import { createNote } from "./create";
import { listNotes } from "./list";

export const noteRouter = new Elysia({ prefix: "/notes" })
	.use(createNote)
	.use(listNotes);
