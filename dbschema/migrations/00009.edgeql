CREATE MIGRATION m1g3bsb7rj3ypvusgnkekg6g7zetyzd7xvl564gqjkdb4zwjfphyyq
    ONTO m1n5yfow7yvygzyzix542fym6svcupjqrwdsj6zu54subohzbz52eq
{
  ALTER TYPE default::JoinRequest {
      CREATE LINK reviewedBy: default::User;
      CREATE PROPERTY reviewedAt: std::datetime;
  };
  ALTER TYPE default::User {
      ALTER PROPERTY displayname {
          DROP CONSTRAINT std::exclusive;
      };
      ALTER PROPERTY username {
          CREATE CONSTRAINT std::exclusive;
      };
  };
};
