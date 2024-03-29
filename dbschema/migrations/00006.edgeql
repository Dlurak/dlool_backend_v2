CREATE MIGRATION m14j4szqlr74t67qbfcb55ukpjenf6n7bsg444albnz6y3ca3m7nsq
    ONTO m12drjaftq6ko7ez5n75r6gmuid4nzrxufl7pnyv5cx52zaglhqt7q
{
  CREATE TYPE default::Class {
      CREATE MULTI LINK students: default::User {
          CREATE PROPERTY joinedAt: std::datetime {
              SET default := (std::datetime_current());
              SET readonly := true;
          };
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY name: std::str;
  };
  CREATE TYPE default::School {
      CREATE MULTI LINK classes: default::Class {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Class {
      CREATE SINGLE LINK school := (.<classes[IS default::School]);
  };
};
