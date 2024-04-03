module default {
	scalar type Authmethod extending enum<Password>;

	type User {
		required username: str {
			constraint exclusive;
		};
		required displayname: str;

		required multi authmethod: Authmethod;
		multi tokens: RefreshToken {
			constraint exclusive;
			on target delete allow;
		};

		# keys: Authmethods
		# value: required data
		required authsecret: json;
		
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};

		classes := .<students[is Class];
		assignments := .<updatedBy[is Assignment];
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
			# Not used - may be removed
			joinedAt: datetime {
				default := datetime_current();
				readonly := true;
			};
		};

		single school := .<classes[is School];

		assignments := .<class[is Assignment];

		required created: datetime {
			default := datetime_current();
			readonly := true;
		};
	}
	
	scalar type Status extending enum<Pending, Accepted, Rejected>;

	type JoinRequest {
		required wantsToJoin: Class {
			readonly := true;
		};
		required user: User {
			readonly := true;
		};
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};

		required status: Status {
			default := 'Pending';
		};

		reviewedAt: datetime;
		reviewedBy: User;
	}

	type Assignment {
		required subject: str;
		required description: str;

		required dueDate: datetime;
		required fromDate: datetime;

		required multi updates: datetime {
			default := datetime_current();
		};
		required multi updatedBy: User;

		multi completedBy: User;

		required class: Class {
			readonly := true;
		};
	}
}
