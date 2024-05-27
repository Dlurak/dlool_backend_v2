import Elysia from "elysia";
import { specificCalendar } from "routes/calendar/id";
import { createCalendar } from "./create";
import { deleteCalendar } from "./delete";
import { listCalendar } from "./list";
import { updateCalendar } from "./update";

export const calendarRouter = new Elysia({ prefix: "/calendar" })
	.use(listCalendar)
	.use(specificCalendar)
	.use(createCalendar)
	.use(updateCalendar)
	.use(deleteCalendar);
