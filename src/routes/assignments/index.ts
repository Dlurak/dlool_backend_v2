import Elysia from "elysia";
import { createAssignment } from "./create";
import { deleteAssignment } from "./delete";
import { listAssignments } from "./list";
import { updateAssignment } from "./update";

export const assignmentsRouter = new Elysia({ prefix: "/assignments" })
	.use(listAssignments)
	.use(createAssignment)
	.use(deleteAssignment)
	.use(updateAssignment);
