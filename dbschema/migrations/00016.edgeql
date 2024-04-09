CREATE MIGRATION m1k5kk6wjhcyjkqblwsla7tml2hbmfohxsdafccqr45wapyvwfwhva
    ONTO m1hmgl6ihppy3vtahtblnbmpvhbrn7vtjhloj5f7f2e6qgwsn7eqgq
{
  ALTER TYPE default::Assignment {
      ALTER LINK updates {
          ON SOURCE DELETE DELETE TARGET;
      };
  };
};
