import { BaseEntity, createEntities, Entities } from "./entities";
import getDBQueryBuilder, { recreateEntityTables } from "./db/db";
import startApollo from "./server";
import { readEnv } from "./env";

export default async (
  srcEntities: Entities,
  srcBaseEntity: BaseEntity = []
) => {
  const dbQuery = await getDBQueryBuilder(readEnv("postgres"));
  const entities = createEntities(srcEntities, srcBaseEntity);
  await recreateEntityTables(dbQuery, entities);
  const { url } = await startApollo(readEnv("apollo"), dbQuery, entities);
  console.log(`🚀 Server ready at ${url}`);
};
