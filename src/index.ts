import { BaseEntity, Entities } from "./entities";
import start from "./startup";

/////////////////////////////////////////////
// TEST CODE ////////////////////////////////
/////////////////////////////////////////////

const BASE_ENTITY: BaseEntity = [
  { name: "created", type: "Int" },
  { name: "updated", type: "Int" },
];

const ENTITIES: Entities = [
  [
    "organization",
    [
      { name: "name", type: "String" },
      { name: "email", type: "String" },
    ],
  ],
  [
    "person",
    [
      { name: "firstname", type: "String" },
      { name: "lastname", type: "String" },
      { name: "email", type: "String" },
    ],
  ],
  [
    "task",
    [
      { name: "title", type: "String" },
      { name: "description", type: "String" },
    ],
  ],
];

start(ENTITIES, BASE_ENTITY);

/////////////////////////////////////////////
// TEST CODE ////////////////////////////////
/////////////////////////////////////////////
