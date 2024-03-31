CREATE MIGRATION m1whcftw3ixmaofcafcskg2ttd5f4kpecobinvtejd66vge4p5whxq
    ONTO m1h2a4cqyvh3sfyprjlvecaakpxyoaz53e3egs4qdlf2zeapdzfvqa
{
  ALTER TYPE default::Assignment {
      ALTER LINK completedBy {
          RESET OPTIONALITY;
      };
  };
};
