CREATE MIGRATION m17fqphiq6jr5unbqqolhaopjqdcgklmjowirlpgkejf2qsqocypsq
    ONTO m1mzn3ehkgkjrnujdwfxjhe5optsk3cmyqkdagwev6vq2p5a4xxbsa
{
  ALTER TYPE default::Note {
      CREATE LINK creator: default::User {
          ON TARGET DELETE ALLOW;
      };
      ALTER PROPERTY editScope {
          SET REQUIRED USING (default::EditScope.Self);
      };
  };
};
