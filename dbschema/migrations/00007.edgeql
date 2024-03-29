CREATE MIGRATION m1psgxwipft63xhdvv24e4bboazf26v6doqseu3nyzyoa3oecmjp4q
    ONTO m14j4szqlr74t67qbfcb55ukpjenf6n7bsg444albnz6y3ca3m7nsq
{
  ALTER TYPE default::User {
      CREATE LINK classes := (.<students[IS default::Class]);
  };
};
