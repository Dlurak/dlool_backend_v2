CREATE MIGRATION m1mzn3ehkgkjrnujdwfxjhe5optsk3cmyqkdagwev6vq2p5a4xxbsa
    ONTO m1xsbfzwxprtxttepfmhlwzsayxv3keyigzrfa2o2zk3g4zttajubq
{
  ALTER TYPE default::Calendar {
      ALTER LINK tags {
          ON TARGET DELETE ALLOW;
      };
  };
  CREATE SCALAR TYPE default::EditScope EXTENDING enum<Self, Class, School>;
  CREATE TYPE default::Note {
      CREATE REQUIRED LINK class: default::Class {
          SET readonly := true;
      };
      CREATE MULTI LINK tags: default::Tag {
          ON TARGET DELETE ALLOW;
      };
      CREATE MULTI LINK updates: default::Change {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
      };
      CREATE PROPERTY editScope: default::EditScope {
          SET default := (default::EditScope.Self);
      };
      CREATE PROPERTY priority: default::Priority;
      CREATE PROPERTY summary: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
  };
};
