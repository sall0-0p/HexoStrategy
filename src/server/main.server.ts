import { buildNeighborsCube } from "./modules/hex/NeighbourBuilder";
import { buildHexRegistry } from "./modules/hex/HexRegistry";
import { buildNationRegistry } from "./modules/nation/NationRegistry";

buildNationRegistry();
buildHexRegistry();
buildNeighborsCube();