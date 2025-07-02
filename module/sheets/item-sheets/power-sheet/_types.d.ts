import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs";
import { TeriockPower } from "../../../types/documents";

declare module "./power-sheet.mjs" {
  export default interface TeriockPowerSheet extends TeriockBaseItemSheet {
    item: TeriockPower;
    document: TeriockPower;
  }
}
