import { Client as PSQLClient, QueryResult } from "pg";
import { Entities, FieldType } from "../entities";
import { make } from "../util/fp";

export type DBQueryBuilder = ReturnType<typeof getDBQueryBuilder>;

type DBConf = Parameters<typeof makePSQLClient>[0];

type DataType = "int" | "varchar(255)";

const makePSQLClient = make(PSQLClient);

const connectPSQLClient = async (client: PSQLClient) => {
  await client.connect();
  return client;
};

const getDBQueryBuilder =
  (psqlClient: PSQLClient) =>
  async <T>([qStr, qVals]: [string] | [string, any[]]) =>
    (await psqlClient.query(qStr, qVals)) as QueryResult<T>;

const FIELDTYPE_TO_DATATYPE_MAP: Record<FieldType, DataType> = {
  Int: "int",
  String: "varchar(255)",
};

const createEntityTables = (dbQuery: DBQueryBuilder, entities: Entities) =>
  dbQuery([
    entities
      .map(
        ([entity, fields]) =>
          /* sql */ `CREATE TABLE ${entity} (${fields
            .map(
              ({ name, type }) => `${name} ${FIELDTYPE_TO_DATATYPE_MAP[type]}`
            )
            .join(",")}, id serial PRIMARY KEY)`
      )
      .join(";"),
  ]);

const dropEntityTables = (dbQuery: DBQueryBuilder, entities: Entities) =>
  dbQuery([
    /* sql */ `DROP TABLE IF EXISTS ${entities
      .map(([entity]) => entity)
      .join(", ")} CASCADE`,
  ]);

export const recreateEntityTables = async (
  dbQuery: DBQueryBuilder,
  entities: Entities
) => {
  await dropEntityTables(dbQuery, entities);
  await createEntityTables(dbQuery, entities);
};

export default async (conf: DBConf) =>
  getDBQueryBuilder(await connectPSQLClient(makePSQLClient(conf)));
