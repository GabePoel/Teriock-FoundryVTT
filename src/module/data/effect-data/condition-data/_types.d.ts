import { TeriockAttunement } from "../../../documents/_documents.mjs";
import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";
import { TeriockBaseEffectSchema } from "../base-effect-data/_types";

export interface TeriockConditionSchema extends TeriockBaseEffectSchema {
  /** Wiki Namespace */
  readonly wikiNamespace: "Condition";
  /** Parent */
  parent: TeriockAttunement;
}

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData extends TeriockConditionSchema, TeriockBaseEffectData {}
}
