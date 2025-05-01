import { ReplicatedStorage, RunService, Workspace } from "@rbxts/services";
import { Nation } from "../nation/Nation";
import { NationRegistry } from "../nation/NationRegistry";
export type RawHex = {
  name: any;
  q: any;
  r: any;
  hexType: any;
  owner?: any;
};

export class Hex {
  private readonly id: string;
  public readonly name: string;
  public readonly q: number;
  public readonly r: number;
  public readonly s: number;
  public readonly hexType: string;
  public owner?: Nation;
  public neighbors: string[] = [];
  public model: BasePart;

  constructor(id: string, def: RawHex) {
    this.id = id;

    // runtime validation
    if (typeOf(def.name) !== "string") error(`Hex ${id}: name must be a string`);
    if (typeOf(def.q)    !== "number") error(`Hex ${id}: q must be a number`);
    if (typeOf(def.r)    !== "number") error(`Hex ${id}: r must be a number`);
    if (typeOf(def.hexType) !== "string") error(`Hex ${id}: hexType must be a string`);

    this.name = def.name;
    this.q    = def.q;
    this.r    = def.r;
    this.s    = -this.q - this.r;
    this.hexType = def.hexType;

    if (def.owner) {
      if (typeOf(def.owner) !== "string") error(`Hex ${id}: owner has to be string or undefined`);
      this.owner = NationRegistry[def.owner as string];
    }

    // Create physical hex
    const hexes = ReplicatedStorage.WaitForChild("Assets").WaitForChild("Hexes");
    const hexContainer = Workspace.WaitForChild("Heatmaps").WaitForChild("Unassigned");
    const hexTemplate = hexes.WaitForChild(this.hexType) as BasePart;

    const model = hexTemplate.Clone();
    model.Name = this.id;
    model.SetAttribute("id", this.id);
    model.SetAttribute("q", this.q);
    model.SetAttribute("r", this.r);
    model.SetAttribute("s", this.s);
    model.SetAttribute("name", this.name);
    model.Parent = hexContainer;
    model.Position = this.getCenter();

    if (this.owner) {
      model.SetAttribute("owner", this.owner.id);
    }

    if (this.r % 2 !== this.q % 2) {
      model.Color = Color3.fromRGB(235, 235, 235);
    } else {
      model.Color = Color3.fromRGB(255, 255, 255);
    }

    this.model = model;
    if (math.random(1, 10) === 1) {
      RunService.Heartbeat.Wait();
    }
  }

  public setOwner(owner: Nation) {
    this.owner = owner;
    this.model.SetAttribute("owner", this.owner.id);
  }

  public getCenter() {
    const size: number = 1.299 / math.sqrt(3);
    const offset: Vector2 = this.axialToOdd();
    const x: number = size * math.sqrt(3) * (offset.X + 0.5 * (offset.Y % 2));
    const y: number = ((size * 3) / 2) * offset.Y;

    return new Vector3(x, 1, y);
  }

  private axialToOdd(): Vector2 {
    const col: number = this.q + (this.r - this.r) / 2;
    const row: number = this.r;
    return new Vector2(col, row);
  }
}
