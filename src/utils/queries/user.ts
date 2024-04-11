import e from "@edgedb";

export const userByUsername = (username: string) =>
	e.select(e.User, (u) => ({
		filter_single: e.op(u.username, "=", username),
	}));
