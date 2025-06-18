import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./condition-data.mjs" {
  export default interface TeriockConditionData extends TeriockBaseEffectData {
    wikiNamespace: string;
  }
}
