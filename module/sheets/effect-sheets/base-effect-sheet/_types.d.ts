import TeriockBaseEffectData from "../../../data/effect-data/base-effect-data/base-effect-data.mjs";
import TeriockEffect from "../../../documents/effect.mjs";
import { ActiveEffectConfig } from "@client/applications/sheets/_module.mjs";
import { TeriockSheet } from "../../mixins/_types";

declare module "./base-effect-sheet.mjs" {
  export default interface TeriockBaseEffectSheet extends TeriockSheet, ActiveEffectConfig {
    effect: TeriockEffect & {
      system: TeriockBaseEffectData;
    };
    document: TeriockEffect & {
      system: TeriockBaseEffectData;
    };
  }
}
