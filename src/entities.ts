type Entity = [string, Field[]];

export type Entities = Entity[];

export type BaseEntity = Field[];

export type FieldType = "String" | "Int";

export type Field = {
  name: string;
  type: FieldType;
};

export const fieldToGQLParam = ({ name, type }: Field) => `${name}: ${type}`;

export const createEntities = (
  entityDeclaration: Entities,
  baseEntity: BaseEntity
): Entities =>
  entityDeclaration.map(([entity, fields]) => [
    entity,
    [...baseEntity, ...fields],
  ]);
