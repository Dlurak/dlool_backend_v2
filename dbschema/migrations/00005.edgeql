CREATE MIGRATION m12drjaftq6ko7ez5n75r6gmuid4nzrxufl7pnyv5cx52zaglhqt7q
    ONTO m1wfieehehzfcea5biu2kowxa5wb45di444kia3zbyp26mhdu7esxa
{
  ALTER TYPE default::RefreshToken {
      DROP PROPERTY client;
      ALTER PROPERTY created {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      DROP PROPERTY expires;
      ALTER PROPERTY token {
          SET readonly := true;
      };
  };
};
