CREATE MIGRATION m1sty7i6q5winkndbyoecud6k7wkx6cd7hvlg4yx5d3ncwdjlbba3q
    ONTO m1k5kk6wjhcyjkqblwsla7tml2hbmfohxsdafccqr45wapyvwfwhva
{
  CREATE TYPE default::Tag {
      CREATE REQUIRED LINK class: default::Class;
      CREATE PROPERTY color: std::str;
      CREATE REQUIRED PROPERTY tag: std::str;
  };
  CREATE SCALAR TYPE default::Priority EXTENDING enum<Critical, High, Medium, Low>;
  CREATE TYPE default::Calendar {
      CREATE REQUIRED LINK class: default::Class {
          SET readonly := true;
      };
      CREATE MULTI LINK tags: default::Tag;
      CREATE MULTI LINK updates: default::Change {
          ON SOURCE DELETE DELETE TARGET;
          ON TARGET DELETE ALLOW;
      };
      CREATE REQUIRED PROPERTY beginning: std::datetime;
      CREATE PROPERTY ending: std::datetime;
      CREATE PROPERTY location: std::str;
      CREATE PROPERTY priority: default::Priority;
      CREATE PROPERTY summary: std::str;
      CREATE REQUIRED PROPERTY title: std::str;
  };
  ALTER TYPE default::Change {
      CREATE LINK calendar := (.<updates[IS default::Calendar]);
  };
};
