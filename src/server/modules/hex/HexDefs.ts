/* eslint-disable @typescript-eslint/no-explicit-any */
import raw from "shared/data/hexes.json";

type RawHex = {
	name: any;
	q: any;
	r: any;
	hexType: any;
};

export interface HexDef {
	id: string;
	name: string;
	q: number;
	r: number;
	s: number;
	hexType: string;
	neighbors?: string[];
	model?: BasePart;
}

function validateEntry(id: string, raw: RawHex) {
	try {
		return {
			id,
			name: raw.name as string,
			q: raw.q as number,
			r: raw.r as number,
			s: -(raw.q as number) - (raw.r as number),
			hexType: raw.hexType as string,
			neighbors: [],
		};
	} catch {
		error(`Something went wrong when loading hex ${id}`);
	}
}

export const HexDefs: Record<string, HexDef> = {};
for (const [id, rawProv] of pairs(raw as Record<string, RawHex>)) {
	HexDefs[id] = validateEntry(id, rawProv);
}
