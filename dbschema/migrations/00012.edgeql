CREATE MIGRATION m1y23sawvajv4ba3unhkalgzsrnvpadjdkzpsa7vhqbm2ln65wt3dq
    ONTO m1whcftw3ixmaofcafcskg2ttd5f4kpecobinvtejd66vge4p5whxq
{
  ALTER TYPE default::User {
      ALTER LINK tokens {
          ON TARGET DELETE ALLOW;
      };
  };
};
