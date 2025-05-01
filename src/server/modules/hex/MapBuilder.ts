import { buildNeighborsCube } from "./NeighbourBuilder";
import { HexDef, HexDefs } from "./HexDefs";
import { ReplicatedStorage, Workspace } from "@rbxts/services";
import { getHexCenter } from "./HexUtils";

export function buildMap() {
	buildNeighborsCube(HexDefs);

	const hexes = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Hexes");
	const hexContainer = Workspace.WaitForChild("Heatmaps").WaitForChild("Unassigned");
	for (const [id, hex] of pairs(HexDefs)) {
		const hexTemplate = hexes.WaitForChild(hex.hexType) as BasePart;
		if (hexTemplate) {
			const model = hexTemplate.Clone();
			model.SetAttribute("id", hex.id);
			model.SetAttribute("q", hex.q);
			model.SetAttribute("r", hex.r);
			model.SetAttribute("s", hex.s);
			model.SetAttribute("name", hex.name);
			model.Parent = hexContainer;
			model.Position = getHexCenter(hex);
			print(`Added ${hex.id}`)

			hex.model = model;
		}
	}
}
