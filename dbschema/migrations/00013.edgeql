CREATE MIGRATION m1g7zzumkuvubppu53mcmxqcs73v2xyvueiz3cshqj75qd4uy2qafq
    ONTO m1y23sawvajv4ba3unhkalgzsrnvpadjdkzpsa7vhqbm2ln65wt3dq
{
  ALTER TYPE default::User {
      DROP PROPERTY authmethod;
  };
  ALTER TYPE default::User {
      DROP PROPERTY authsecret;
  };
  ALTER TYPE default::User {
      CREATE REQUIRED PROPERTY password: std::str {
          SET REQUIRED USING (<std::str>'');
      };
  };
  DROP SCALAR TYPE default::Authmethod;
};
