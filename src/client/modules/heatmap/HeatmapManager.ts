import { Workspace } from "@rbxts/services";

type GroupKey = string;

interface HeatmapGroup {
	container: Model,
	highlight: Highlight,
	highlightProps: {
		FillColor: Color3;
		FillTransparency: number,
		OutlineColor: Color3,
		OutlineTransparency: number,
	}
}

export class Heatmap {
	// groups: HeatmapGroup[],
	// getGroup: (hexId: string) => HeatmapGroup,
	// buildGroups: (hexId: string) => HeatmapGroup[],
	private groups = new Map<GroupKey, HeatmapGroup>()
	private hexes = new Set<BasePart>();
	private connections = new Map<BasePart, RBXScriptConnection[]>();

	constructor(
		private attributeName: string,
		private bucketFn: (value: unknown) => GroupKey,
		private styleFn: (key: GroupKey) => HeatmapGroup["highlightProps"]
	) {};

	public addHex(hex: BasePart) {
		if (this.hexes.has(hex)) return;
		this.hexes.add(hex);

		const connection = hex.GetAttributeChangedSignal(this.attributeName)
			.Connect(() => this.updateHex(hex));

		this.connections.set(hex, [connection]);
		this.updateHex(hex);
	}

	public removeHex(hex: BasePart) {
		if (!this.hexes.has(hex)) return;
		this.hexes.delete(hex);

		for (const c of this.connections.get(hex) ?? []) c.Disconnect();
		this.connections.delete(hex);

		hex.Parent = Workspace.WaitForChild("Heatmaps").WaitForChild("Unassigned");
	}

	public updateHex(hex: BasePart) {
		const raw = hex.GetAttribute(this.attributeName);
		const key = this.bucketFn(raw);
		print(raw, key)

		const oldKey = this.findCurrentGroupKey(hex);
		if (oldKey === key) return;

		if (oldKey) {
			const old = this.groups.get(oldKey)!.container;
			if (hex.Parent === old) hex.Parent = undefined;
		}

		let group = this.groups.get(key);
		if (!group) {
			const props = this.styleFn(key);
			const container = new Instance("Model");
			container.Name = `HeatGroup_${this.attributeName}_${key}`
			container.Parent = Workspace.WaitForChild("Heatmaps");

			const highlight: Highlight = new Instance("Highlight");
			highlight.Adornee = container;
			highlight.FillColor = props.FillColor;
			highlight.FillTransparency = props.FillTransparency;
			highlight.OutlineColor = props.OutlineColor;
			highlight.OutlineTransparency = props.OutlineTransparency;
			highlight.Parent = container;

			group = {
				container, highlight, highlightProps: props
			}
			this.groups.set(key, group);
		}

		hex.Parent = group.container;
		group.container.Parent = undefined;
		group.container.Parent = Workspace.WaitForChild("Heatmaps");
	}

	public clear() {
		for (const hex of this.hexes) this.removeHex(hex)
		this.groups.forEach((heatmapGroup) => {
			heatmapGroup.container.Destroy();
		})
		this.groups.clear()
	}

	private findCurrentGroupKey(hex: BasePart): GroupKey | undefined {
		for (const [key, grp] of this.groups) {
			if (hex.Parent === grp.container) return key
		}
	}
}

export class HeatmapManager {
	private maps = new Map<string, Heatmap>()

	public create(
		name: string,
		attributeName: string,
		bucketFn: (value: unknown) => string,
		styleFn: (key: string) => HeatmapGroup["highlightProps"]
	) {
		if (this.maps.has(name)) error(`Heatmap ${name} exists`)
		const map = new Heatmap(attributeName, bucketFn, styleFn)
		this.maps.set(name, map)
		return map
	}

	public get(name: string) {
		return this.maps.get(name)
	}

	public destroy(name: string) {
		const m = this.maps.get(name)
		if (!m) return
		m.clear()
		this.maps.delete(name)
	}
}

