import { HexDefs, HexDef } from "server/modules/hex/HexDefs";

const CUBE_DIRECTIONS: [number, number, number][] = [
	[1, -1, 0],
	[1, 0, -1],
	[0, 1, -1],
	[-1, 1, 0],
	[-1, 0, 1],
	[0, -1, 1],
];

export function buildNeighborsCube(defs: Record<number, HexDef>): void {
	const coordMap = new Map<string, number>();
	for (const [id, def] of pairs(defs)) {
		coordMap.set(`${def.q},${def.r},${def.s}`, id as number);
	}
	for (const [id, def] of pairs(defs)) {
		const neigh: string[] = [];
		for (const [dx, dy, dz] of CUBE_DIRECTIONS) {
			const key = `${def.q + dx},${def.r + dy},${def.s + dz}`;
			const nid = coordMap.get(key);
			if (nid) neigh.push(nid as unknown as string);
		}
		def.neighbors = neigh;
	}
}
