import BaseItemSheet from "../base-item-sheet.mjs";

declare module "./species-sheet.mjs" {
  export default interface TeriockSpeciesSheet extends BaseItemSheet {
    get document(): TeriockSpecies;
    get item(): TeriockSpecies;
  }
}
