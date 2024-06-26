module default {
	type User {
		required username: str {
			constraint exclusive;
		};
		required displayname: str;

		multi tokens: RefreshToken {
			constraint exclusive;
			on target delete allow;
			on source delete delete target;
		};

		required password: str;
		
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};

		classes := .<students[is Class];
		changes := .<user[is Change];
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
			on target delete allow;
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
			on target delete delete source;
		};
		required created: datetime {
			default := datetime_current();
			readonly := true;
		};

		required status: Status {
			default := 'Pending';
		};

		reviewedAt: datetime;
		reviewedBy: User {
			on target delete allow;
		};
	}

	type Assignment {
		required subject: str;
		required description: str;

		required dueDate: datetime;
		required fromDate: datetime;

		multi updates: Change {
			on target delete allow;
			on source delete delete target;
		};

		multi completedBy: User {
			on target delete allow;
		};

		required class: Class {
			readonly := true;
		};
	}

	scalar type Priority extending enum<Critical, High, Medium, Low, Minimal>;

	type Calendar {
		required class: Class {
			readonly := true;
		};


		required title: str;
		summary: str;

		required beginning: datetime;
		# It may sound stupid, but in school we don't
		# always know how long something will take, so it is optional
		ending: datetime;

		location: str;


		multi tags: Tag {
			on target delete allow;
		};
		priority: Priority;

		multi updates: Change {
			on target delete allow;
			on source delete delete target;
		};
	}

	scalar type EditScope extending enum<Self, Class, School>;

	type Note {
		required class: Class {
			readonly := true;
		};

		required title: str;
		summary: str;

		multi tags: Tag {
			on target delete allow;
		};
		priority: Priority;

		required editScope: EditScope {
			default := EditScope.Self;
		};

		creator: User {
			on target delete allow;
		};
		multi updates: Change {
			on target delete allow;
			on source delete delete target;
		};
	}

	type Tag {
		required tag: str;
		color: str;
		required class: Class;
	}

	type Change {
		required user: User {
			on target delete delete source;
		};
		required time: datetime {
			default := datetime_current();
		};

		assignments := .<updates[is Assignment];
		calendar := .<updates[is Calendar];
	}
}
