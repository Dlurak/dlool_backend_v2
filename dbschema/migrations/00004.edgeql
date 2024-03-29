CREATE MIGRATION m1wfieehehzfcea5biu2kowxa5wb45di444kia3zbyp26mhdu7esxa
    ONTO m1fk44r3i6otexu3y5dvhqannjgipvxzw43muyjd6ituf3uzxinvmq
{
  ALTER TYPE default::User {
      ALTER LINK tokens {
          RESET OPTIONALITY;
      };
      ALTER PROPERTY created {
          SET readonly := true;
      };
  };
};
