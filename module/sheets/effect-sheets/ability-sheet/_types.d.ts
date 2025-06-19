import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs"
import type TeriockEffect from "../../../documents/effect.mjs"
import type TeriockAbilityData from "../../../data/effect-data/ability-data/ability-data.mjs"

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockAbilityData };
    document: TeriockEffect & { system: TeriockAbilityData };
  }
}