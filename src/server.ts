import {
  ApolloServer as Apollo,
  Config as ApolloConfig,
  gql,
  IResolvers,
} from "apollo-server";
import { DBQueryBuilder } from "./db/db";
import { Entities, fieldToGQLParam } from "./entities";
import { make, reduceArrToObj } from "./util/fp";
import { capitalize } from "./util/string";

type ApolloConf = Parameters<Apollo["listen"]>[0];

const getQueriersAndMutators = (dbQuery: DBQueryBuilder) => ({
  readQuery:
    <T>(entity: string) =>
    async (_: any, params?: { id: number }) => {
      const hasIdParam = params?.id !== undefined;
      const { rows } = await dbQuery<T>([
        /* sql */ `SELECT * FROM ${entity} ${
          hasIdParam ? /*sql */ `WHERE id = $1` : ""
        }`,
        hasIdParam ? [params?.id] : [],
      ]);
      return hasIdParam ? rows[0] : rows;
    },

  createMutation:
    <T>(entity: string) =>
    async (_: any, params: T) =>
      (
        await dbQuery<T>([
          /* sql */ `INSERT INTO ${entity}(${Object.keys(params).join(
            ","
          )}) VALUES(${Object.keys(params).map(
            (_, i) => `$${i + 1}`
          )}) RETURNING *`,
          Object.keys(params).map((k) => params[k as keyof T]),
        ])
      ).rows[0],

  updateMutation:
    <T>(entity: string) =>
    async (_: any, { id, ...rest }: Partial<T> & { id: number }) => {
      const keysAndValues = Object.keys(rest).map((k) => [
        k,
        rest[k as keyof typeof rest],
      ]);
      return (
        await dbQuery<T>([
          /* sql */ `UPDATE ${entity} SET ${keysAndValues.map(
            ([key], i) => `${key} = $${i + 2}`
          )} WHERE id = $1`,
          [id, ...keysAndValues.map(([, value]) => value)],
        ])
      ).rows[0];
    },

  deleteMutation:
    <T>(entity: string) =>
    async (_: any, { id }: { id: string }) =>
      (
        await dbQuery<T>([
          /* sql */ `DELETE FROM ${entity} WHERE id = $1`,
          [id],
        ])
      ).rows,
});

const getResolvers = (
  dbQuery: DBQueryBuilder,
  entities: Entities
): IResolvers<any, any> => {
  const { readQuery, createMutation, updateMutation, deleteMutation } =
    getQueriersAndMutators(dbQuery);
  return {
    Query: {
      ...reduceArrToObj(
        ([entity]) => ({ [`read${capitalize(entity)}s`]: readQuery(entity) }),
        entities
      ),
    },
    Mutation: {
      ...reduceArrToObj(
        ([entity]) => ({
          [`create${capitalize(entity)}`]: createMutation(entity),
        }),
        entities
      ),
      ...reduceArrToObj(
        ([entity]) => ({
          [`update${capitalize(entity)}`]: updateMutation(entity),
        }),
        entities
      ),
      ...reduceArrToObj(
        ([entity]) => ({
          [`delete${capitalize(entity)}`]: deleteMutation(entity),
        }),
        entities
      ),
    },
  };
};

const getTypeDefs = (entities: Entities) => gql`
  ${entities
    .map(
      ([entity, fields]) => `type ${capitalize(entity)} {\n
    id: ID!\n
    ${fields.map(fieldToGQLParam).join(", ")}
    }`
    )
    .join("\n")}

  type Query {
    ${entities
      .map(
        ([entity]) =>
          `"Gets a ${entity} by id, or all entities if id is omitted"\nread${capitalize(
            entity
          )}s(id: ID): [${capitalize(entity)}]`
      )
      .join("\n")}
  }

  type Mutation {
    ${entities
      .map(
        ([entity, fields]) =>
          `"Creates a ${entity}."\n
        create${capitalize(entity)}(${fields
            .map(fieldToGQLParam)
            .map((f) => `${f}!`)
            .join(", ")}): ${capitalize(entity)}\n
        "Updates a ${entity}."\n
        update${capitalize(entity)}(id: ID!, ${fields
            .map(fieldToGQLParam)
            .join(", ")}): ${capitalize(entity)}\n
        "Deletes a ${entity}."\n
        delete${capitalize(entity)}(id: ID!): ${capitalize(entity)}`
      )
      .join("\n")}
  }
`;

const getApolloDeclaration = (
  dbQuery: DBQueryBuilder,
  entities: Entities
): ApolloConfig => ({
  typeDefs: getTypeDefs(entities),
  resolvers: getResolvers(dbQuery, entities),
});

const connectApollo = (conf: ApolloConf) => (server: Apollo) =>
  server.listen(conf);

export default (
  conf: ApolloConf,
  dbQuery: DBQueryBuilder,
  entities: Entities
) => {
  const apolloDeclaration = getApolloDeclaration(dbQuery, entities);
  const apollo = make(Apollo)(apolloDeclaration);
  return connectApollo(conf)(apollo);
};
