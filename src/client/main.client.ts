import { Camera } from "client/modules/camera";
import { Players, Workspace } from "@rbxts/services";
import { HeatmapManager } from "client/modules/heatmap/HeatmapManager" // or wherever you put it

Camera.Init();

const heatmapMgr = new HeatmapManager()
const rowHeatmap = heatmapMgr.create(
  /* name */           "RowHeatmap",
  /* attributeName */  "r",
  /* bucketFn */       (raw) => `row_${raw as number}`,         // group key = "row_0", "row_1", …
  /* styleFn */        (key) => {
    // extract the row index from the key
    const row = tonumber(key.split("_")[1])!
    // pick a hue based on row (mod 10 for demo—extend as needed)
    const hue = (row % 10) / 10
    const fillColor = Color3.fromHSV(hue, 0.8, 0.9)
    const outlineColor = fillColor.Lerp(new Color3(1,1,1), 0.5)
    return {
      FillColor:         fillColor,
      FillTransparency:  0.6,
      OutlineColor:      outlineColor,
      OutlineTransparency: 0.3,
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