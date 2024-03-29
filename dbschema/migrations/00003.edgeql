CREATE MIGRATION m1fk44r3i6otexu3y5dvhqannjgipvxzw43muyjd6ituf3uzxinvmq
    ONTO m1sbrhahryna44lkzgdmu3vxb7wbism3xpsbusoqxichaj7lktheyq
{
  CREATE TYPE default::RefreshToken {
      CREATE REQUIRED PROPERTY client: std::str;
      CREATE REQUIRED PROPERTY created: std::datetime;
      CREATE REQUIRED PROPERTY expires: std::datetime;
      CREATE REQUIRED PROPERTY token: std::str;
  };
  ALTER TYPE default::User {
      CREATE REQUIRED MULTI LINK tokens: default::RefreshToken {
          SET REQUIRED USING (<default::RefreshToken>{});
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
