module default {
	scalar type Authmethod extending enum<Password>;

	type User {
		required username: str;
		required displayname: str {
			constraint exclusive;
		};

		required multi authmethod: Authmethod;
		multi tokens: RefreshToken {
			constraint exclusive;
		};

		# keys: Authmethods
		# value: required data
		required authsecret: json;
		
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};
	}

	type RefreshToken {
		required token: str {
			readonly := true;
		};
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};
	}
}
