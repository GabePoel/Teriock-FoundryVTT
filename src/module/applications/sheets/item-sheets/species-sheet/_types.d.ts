import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./species-sheet.mjs" {
  export default interface TeriockSpeciesSheet extends TeriockBaseItemSheet {
    get document(): TeriockSpecies;

    get item(): TeriockSpecies;
  }
}
