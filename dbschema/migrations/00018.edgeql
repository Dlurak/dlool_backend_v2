CREATE MIGRATION m1xsbfzwxprtxttepfmhlwzsayxv3keyigzrfa2o2zk3g4zttajubq
    ONTO m1sty7i6q5winkndbyoecud6k7wkx6cd7hvlg4yx5d3ncwdjlbba3q
{
  ALTER SCALAR TYPE default::Priority EXTENDING enum<Critical, High, Medium, Low, Minimal>;
};
