CREATE MIGRATION m1hmgl6ihppy3vtahtblnbmpvhbrn7vtjhloj5f7f2e6qgwsn7eqgq
    ONTO m1poydrr4wqnyyw2kuxdyz2gkxhomo27tud2b5imhloezqgvhd7spa
{
  ALTER TYPE default::User {
      DROP LINK assignments;
  };
  ALTER TYPE default::Assignment {
      DROP LINK updatedBy;
  };
  ALTER TYPE default::Assignment {
      DROP PROPERTY updates;
  };
  CREATE TYPE default::Change {
      CREATE REQUIRED LINK user: default::User {
          ON TARGET DELETE DELETE SOURCE;
      };
      CREATE REQUIRED PROPERTY time: std::datetime {
          SET default := (std::datetime_current());
      };
  };
  ALTER TYPE default::Assignment {
      CREATE MULTI LINK updates: default::Change {
          ON TARGET DELETE ALLOW;
      };
  };
  ALTER TYPE default::Change {
      CREATE LINK assignments := (.<updates[IS default::Assignment]);
  };
  ALTER TYPE default::User {
      CREATE LINK changes := (.<user[IS default::Change]);
  };
};
