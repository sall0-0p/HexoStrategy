import { ReplicatedStorage, Workspace } from "@rbxts/services";

export type RawNation = {
  name: any,
  color: any,
}

const dataObject = ReplicatedStorage
  .WaitForChild("Assets")
  .WaitForChild("DataObjects")
  .WaitForChild("Nation");
export class Nation {
  public readonly id: string;
  public name: string;
  public color: Color3;
  private model: Instance;
  private player? : Player;

  constructor(id: string, def: RawNation) {
    this.id = id;

    if (typeOf(def.name) !== "string") error("Name has to be string!");
    if (typeOf(def.color) !== "table") error("Color has to be an array!");

    const colorRaw = def.color as Array<number>;
    this.name = def.name;
    this.color = Color3.fromRGB(colorRaw[0], colorRaw[1], colorRaw[2]) // strange construct, but roblox-ts requires it.

    this.model = dataObject.Clone();
    this.model.Name = this.id;
    this.model.SetAttribute("id", this.id);
    this.model.SetAttribute("name", this.name);
    this.model.SetAttribute("color", this.color);
    this.model.Parent = Workspace.WaitForChild("Nations");
  }

  public assignPlayer(player?: Player) {
    if (player) {
      this.player = player;
      this.model.SetAttribute("playerId", player.UserId);
    } else {
      this.player = undefined;
      this.model.SetAttribute("playerId", "");
    }
  }
}