import raw from "shared/data/nations.json";
import { Nation, RawNation } from "./Nation";

export const NationRegistry: Record<string, Nation> = {};
export function buildNationRegistry() {
  for (const [id, rawDef] of pairs(raw as Record<string, RawNation>)) {
    NationRegistry[id] = new Nation(id, rawDef);
  }
}
