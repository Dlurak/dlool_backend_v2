CREATE MIGRATION m1poydrr4wqnyyw2kuxdyz2gkxhomo27tud2b5imhloezqgvhd7spa
    ONTO m1g7zzumkuvubppu53mcmxqcs73v2xyvueiz3cshqj75qd4uy2qafq
{
  ALTER TYPE default::Assignment {
      ALTER LINK completedBy {
          ON TARGET DELETE ALLOW;
      };
      ALTER LINK updatedBy {
          ON TARGET DELETE ALLOW;
      };
  };
  ALTER TYPE default::Class {
      ALTER LINK students {
          ON TARGET DELETE ALLOW;
      };
  };
  ALTER TYPE default::JoinRequest {
      ALTER LINK reviewedBy {
          ON TARGET DELETE ALLOW;
      };
      ALTER LINK user {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
  ALTER TYPE default::User {
      ALTER LINK tokens {
          ON SOURCE DELETE DELETE TARGET;
      };
  };
};
