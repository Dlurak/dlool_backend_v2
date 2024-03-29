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

		classes := .<students[is Class];
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

	type School {
		required name: str {
			constraint exclusive;
		};
		required description: str;

		required created: datetime {
			default := datetime_current();
			readonly := true;
		};	
		
		multi classes: Class {
			constraint exclusive;
		};
	}
	
	type Class {
		required name: str;

		multi students: User {
			joinedAt: datetime {
				default := datetime_current();
				readonly := true;
			};
		};

		single school := .<classes[is School];
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};
	}
}
