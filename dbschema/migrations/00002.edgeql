CREATE MIGRATION m1sbrhahryna44lkzgdmu3vxb7wbism3xpsbusoqxichaj7lktheyq
    ONTO m1b23cvruthndtudj5sfzplyqod7gp6zxgwtypqde7hyqh5z2ythva
{
  ALTER SCALAR TYPE default::Authmethod EXTENDING enum<Password>;
};
