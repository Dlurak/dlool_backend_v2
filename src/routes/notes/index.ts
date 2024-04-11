import Elysia from "elysia";
import { createNote } from "./create";

export const noteRouter = new Elysia({ prefix: "/notes" }).use(createNote);
