import type { TeriockSpecies } from "../../../../documents/_documents.mjs";
import TeriockBaseItemSheet from "../base-item-sheet/base-item-sheet.mjs";

declare module "./species-sheet.mjs" {
  export default interface TeriockSpeciesSheet extends TeriockBaseItemSheet {
    get item(): TeriockSpecies;

    get document(): TeriockSpecies;
  }
}
