# crud-generate
A prototype of a solution building a full crud (graphql) out of a provided schema.

## Get started
- have postgres database running (dockerized in the future)
- fill env.json with your database connection parameters
- npm install
- npm start

## How to use
The index.ts has your "entity declaration". With that you can declare what kind of data you're working with. TypeScript will guide you through the implementation.

## Notes
As the solution is currently under development, the program is set to drop and recreate the used tables on every restart. You can comment that out in startup.ts

### TODO
- Relations
- Migrations
- Better datatypes
- Better "entity declaration", possibly with just pure graphql syntax
- Much more...
