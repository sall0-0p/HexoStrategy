import { HexDef } from "./HexDefs";

function axial_to_oddr(hex: HexDef): Vector2 {
	const col: number = hex.q + (hex.r - hex.r) / 2;
	const row: number = hex.r;
	return new Vector2(col, row);
}

export function getHexCenter(hex: HexDef) {
	const size: number = 1.299 / math.sqrt(3);
	const offset: Vector2 = axial_to_oddr(hex);
	const x: number = size * math.sqrt(3) * (offset.X + 0.5 * (offset.Y % 2));
	const y: number = ((size * 3) / 2) * offset.Y;

	return new Vector3(x, 1, y);
}
