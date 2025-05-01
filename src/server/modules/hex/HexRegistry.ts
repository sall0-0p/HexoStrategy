/* eslint-disable @typescript-eslint/no-explicit-any */
import raw from "shared/data/hexes.json";
import { Hex, RawHex } from "./Hex";

export const HexRegistry: Record<string, Hex> = {};
export function buildHexRegistry() {
	for (const [id, rawDef] of pairs(raw as Record<string, RawHex>)) {
		HexRegistry[id] = new Hex(id, rawDef);
	}
}

