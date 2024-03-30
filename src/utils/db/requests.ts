import e from "@edgedb";
import { client } from "index";
import { promiseResult } from "utils/errors";

interface DoesReqAlreadyExistProps {
	username: string;
	class: string;
	school: string;
}

/**
 * Check if a join-request already exists for a given user, class and school
 * It doesn't modify the database but reads from it
 * @throws Error if the database query fails
 * @readonly
 */
export async function doesRequestAlreadyExist(props: DoesReqAlreadyExistProps) {
	const selectRequestQuery = e.select(e.JoinRequest, (jr) => {
		const userMatches = e.op(jr.user.username, "=", props.username);
		const classMatches = e.op(jr.wantsToJoin.name, "=", props.class);
		const schoolMatches = e.op(jr.wantsToJoin.school.name, "=", props.school);

		return {
			filter: e.op(
				userMatches,
				"and",
				e.op(classMatches, "and", schoolMatches),
			),
		};
	});
	const countRequestQuery = e.count(selectRequestQuery);
	const result = await promiseResult(() => countRequestQuery.run(client));

	if (result.status === "error") {
		throw new Error("Failed to check if request already exists");
	}

	return result.data > 0;
}
