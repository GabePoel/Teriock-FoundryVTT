import type TeriockBaseEffectSheet from "../../effect-sheets/base-sheet/base-sheet.mjs";
import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockAbilityData from "../../../data/effect-data/ability-data/ability-data.mjs";

declare module "./ability-mixin.mjs" {
  export default interface TeriockAbilityMixin extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockAbilityData };
    document: TeriockEffect & { system: TeriockAbilityData };
    _tab: string;
    _consequenceTab: string;
  }
}
