import e from "@edgedb";
import { client } from "index";

/**
 * Check if a username is already taken
 * This obviusly reads from the database without modifying it
 * @param username The username to check
 * @returns A boolean indicating if the username is taken
 */
export const isUsernameTaken = async (username: string) => {
	const countQuery = e.count(
		e.select(e.User, (u) => ({
			filter: e.op(u.username, "=", username),
		})),
	);
	const count = await countQuery.run(client);

	return count > 0;
};
