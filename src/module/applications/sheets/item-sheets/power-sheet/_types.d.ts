import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./power-sheet.mjs" {
  export default interface TeriockPowerSheet extends BaseItemSheet {
    get document(): TeriockPower;
    get item(): TeriockPower;
  }
}
