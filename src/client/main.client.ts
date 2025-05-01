import { Camera } from "client/modules/camera";
import { Players, Workspace } from "@rbxts/services";
import { HeatmapManager } from "client/modules/heatmap/HeatmapManager"

Camera.Init();

const heatmapMgr = new HeatmapManager()
const rowHeatmap = heatmapMgr.create(
  "NationMap",
   "owner",
    (raw): string => {
      if (raw) {
        return raw as string;
      } else {
        return "NTL";
      }
    },         // group key = "row_0", "row_1", …
    (key) => {
      if (key === "NTL") {
        return {
          FillColor:         Color3.fromRGB(255, 255, 255),
          FillTransparency:  0.6,
          OutlineColor:      Color3.fromRGB(255, 255, 255),
          OutlineTransparency: 0.3,
        }
      } else {
        const nation = Workspace.WaitForChild("Nations").FindFirstChild(key);

        if (nation) {
          return {
            FillColor:         nation.GetAttribute("color") as Color3,
            FillTransparency:  0.6,
            OutlineColor:      nation.GetAttribute("color") as Color3,
            OutlineTransparency: 0.3,
          }
        } else {
          return {
            FillColor:         Color3.fromRGB(255, 255, 255),
            FillTransparency:  0.6,
            OutlineColor:      Color3.fromRGB(255, 255, 255),
            OutlineTransparency: 0.3,
          }
        }
      }
  }
)

const hexContainer = Workspace.WaitForChild("Heatmaps").WaitForChild("Unassigned");
const hexes = hexContainer.GetChildren();
print("Hello!")
print(hexes.size())
hexes.forEach((hex: Instance) => {
  if (hex.IsA("BasePart")) {
    rowHeatmap.addHex(hex as BasePart)
  } else {
    print(`${hex} is not a BasePart`)
  }
});

hexContainer.ChildAdded.Connect((child: Instance) => {
  if (child.IsA("BasePart")) {
    rowHeatmap.addHex(child as BasePart);
  }
})