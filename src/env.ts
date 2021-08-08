import fs from "fs";
import { errorOut } from "./util/error";

export type Env = {
  apollo: Record<string, string | number>;
  postgres: Record<string, string | number>;
};

const __ENV: Env = JSON.parse(fs.readFileSync("./env.json", "utf-8"));

export const readEnv = (envKey: keyof Env) =>
  __ENV[envKey] || errorOut(`Cannot locate ${envKey} from "env.json"`);
