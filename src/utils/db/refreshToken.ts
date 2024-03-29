import e from "@edgedb";
import { client } from "index";
import { z } from "zod";

/** Verifies a min length of 1 for the two arrays */
const validRefreshTokenQueryResult = z
	.array(
		z.object({
			tokens: z
				.array(
					z.object({
						token: z.string(),
					}),
				)
				.nonempty(),
		}),
	)
	.nonempty();

/**
 * A refresh token needs to be associated with a user.
 * This function checks if a refresh token is associated with a user.
 */
export const isRefreshTokenAccociatedWithUser = async (
	refreshToken: string,
	username: string,
) => {
	const query = e.select(e.User, (u) => ({
		filter: e.op(u.username, "=", username),
		tokens: (t) => ({
			token: true,
			filter: e.op(t.token, "=", refreshToken),
		}),
	}));
	const result = await query.run(client);
	const parsedResult = validRefreshTokenQueryResult.safeParse(result);

	return parsedResult.success;
};
