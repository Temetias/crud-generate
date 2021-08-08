import { make } from "./fp";

const makeError = make(Error);

export const errorOut = (reason: string) => {
  throw makeError(reason);
};
