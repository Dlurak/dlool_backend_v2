CREATE MIGRATION m1n5yfow7yvygzyzix542fym6svcupjqrwdsj6zu54subohzbz52eq
    ONTO m1psgxwipft63xhdvv24e4bboazf26v6doqseu3nyzyoa3oecmjp4q
{
  CREATE SCALAR TYPE default::Status EXTENDING enum<Pending, Accepted, Rejected>;
  CREATE TYPE default::JoinRequest {
      CREATE REQUIRED LINK user: default::User {
          SET readonly := true;
      };
      CREATE REQUIRED LINK wantsToJoin: default::Class {
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY created: std::datetime {
          SET default := (std::datetime_current());
          SET readonly := true;
      };
      CREATE REQUIRED PROPERTY status: default::Status {
          SET default := 'Pending';
      };
  };
};
