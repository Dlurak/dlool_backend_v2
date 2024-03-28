module default {
	scalar type Authmethod extending enum<Password>;

	type User {
		required username: str;
		required displayname: str {
			constraint exclusive;
		};

		required multi authmethod: Authmethod;

		# keys: Authmethods
		# value: required data
		required authsecret: json;
	}
}
