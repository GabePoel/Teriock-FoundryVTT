import TeriockBaseEffectData from "../../../data/effect-data/base-effect-data/base-effect-data.mjs";
import TeriockEffect from "../../../documents/effect.mjs";
import { TeriockBaseEffectSchema } from "../../../data/effect-data/base-effect-data/_types";
import { TeriockSheet } from "../../mixins/_types";

declare module "./base-effect-sheet.mjs" {
  export default interface TeriockBaseEffectSheet extends TeriockSheet {
    document: TeriockEffect & {
      system: TeriockBaseEffectData & TeriockBaseEffectSchema;
    };
  }
}
