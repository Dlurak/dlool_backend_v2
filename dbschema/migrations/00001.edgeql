CREATE MIGRATION m1b23cvruthndtudj5sfzplyqod7gp6zxgwtypqde7hyqh5z2ythva
    ONTO initial
{
  CREATE SCALAR TYPE default::Authmethod EXTENDING enum<Password, Github, Google>;
  CREATE TYPE default::User {
      CREATE REQUIRED MULTI PROPERTY authmethod: default::Authmethod;
      CREATE REQUIRED PROPERTY authsecret: std::json;
      CREATE REQUIRED PROPERTY displayname: std::str {
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY username: std::str;
  };
};
