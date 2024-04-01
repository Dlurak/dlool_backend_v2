# Dlool Backend Version 2

## A digital and collaborative homework management solution

Dlool is a digital and collaborative homework book.
Classical homework books have a lot of problems. These are some of them and how Dlool solves them.

| Problem                                                                                   | Solution                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Some students work only digitally but still use a classical, analog homework book         | Dlool is digital and a highly optimized drop in replacement.                                                                                                                                                                |
| Everyone in a class writes down the same                                                  | Dlool is collaborative, all entries from one class are available for everyone                                                                                                                                               |
| They are not very good for the environment, as it will be thrown away after just one year | Dlool is digital, no paper is needed.                                                                                                                                                                                       |
| They are not very practical                                                               | Dlool is available on all devices.                                                                                                                                                                                          |
| Entries are not very structured                                                           | Dlool has a structured entry system.                                                                                                                                                                                        |
| When you lose your homework book, all your data is lost forever                           | Dlool is digital, you can't lose it.                                                                                                                                                                                        |
| Every year you need a new homework book                                                   | Dlool can be used for multiple years.                                                                                                                                                                                       |
| You are locked into a specific brand                                                      | Dlool is free and open source. With Dlool you can export your data to ical or todo.txt. Also there is [a way](https://github.com/Dlurak/dlool-scriptable/blob/main/reminders/README.md) to sync Dlool with Apple Reminders. |
| Homework, tests and notes are not separate                                                | Dlool has a different system for homework, tests and notes. Everything is separated but still in one place and easy to find.                                                                                                |

## Roadmap

This is the second Version of the backend. Here is a brief roadmap until it will be integrated into the Frontend:

- [ ] Improvements to the authentication system
- [ ] Notes
- [ ] Calendar
- [ ] A SDK for TypeScript
- [ ] Migrating the Frontend from the old to the new API
- [ ] Migrating the data from MongoDB to EdgeDB

## Running locally

The new API is build with Elysia JS and EdgeDB.  

1. Install the dependencies
   ```bash
   bun install
   ```
2. Initialize the EdgeDB
   ```bash
   edgedb project init
   ```
3. Create the query builder for EdgeDB
   ```bash
   bun edgedb
   ```
4. Run the server
   ```bash
   bun run start
   ```

At this point the server will run on localhost port 3000

