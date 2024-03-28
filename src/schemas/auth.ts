import { Static, t } from "elysia";

export const authSecret = t.Object({
  password: t.Optional(t.String()),
});
export type AuthSecret = Static<typeof authSecret>;
