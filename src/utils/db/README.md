# Database Utilities

This is a collection of complexer database operations.  
Only put your queries here if it is simpler to read and understand it as a function call instead of the direct query builder.

## Rules

- Always use the query builder to build your queries!
- Always document your function with a js-doc comment!
    - The comment must specify if the database will be read or written to
    - The comment must specify if an error might be thrown
- If the query fails, throw an error!
    - You may want to use the `promiseResult` utility to abstract errors into values
