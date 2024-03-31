CREATE MIGRATION m1h2a4cqyvh3sfyprjlvecaakpxyoaz53e3egs4qdlf2zeapdzfvqa
    ONTO m1g3bsb7rj3ypvusgnkekg6g7zetyzd7xvl564gqjkdb4zwjfphyyq
{
  CREATE TYPE default::Assignment {
      CREATE REQUIRED LINK class: default::Class {
          SET readonly := true;
      };
      CREATE REQUIRED MULTI LINK completedBy: default::User;
      CREATE REQUIRED MULTI LINK updatedBy: default::User;
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY dueDate: std::datetime;
      CREATE REQUIRED PROPERTY fromDate: std::datetime;
      CREATE REQUIRED PROPERTY subject: std::str;
      CREATE REQUIRED MULTI PROPERTY updates: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE default::Class {
      CREATE LINK assignments := (.<class[IS default::Assignment]);
  };
  ALTER TYPE default::User {
      CREATE LINK assignments := (.<updatedBy[IS default::Assignment]);
  };
};
