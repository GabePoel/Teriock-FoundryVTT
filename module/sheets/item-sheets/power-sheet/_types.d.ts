import type TeriockBaseItemSheet from "../base-sheet/base-sheet.mjs"
import type TeriockItem from "../../../documents/item.mjs"
import type TeriockPowerData from "../../../data/item-data/power-data/power-data.mjs"

declare module "./power-sheet.mjs" {
  export default interface TeriockPowerSheet extends TeriockBaseItemSheet {
    item: TeriockItem & { system: TeriockPowerData };
    document: TeriockItem & { system: TeriockPowerData };
  }
}