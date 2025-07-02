import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockCondition } from "../../../types/documents";

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData extends TeriockBaseEffectData {
    parent: TeriockCondition;
    wikiNamespace: string;
  }
}
