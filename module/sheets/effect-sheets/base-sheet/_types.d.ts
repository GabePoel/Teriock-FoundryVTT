import type TeriockEffect from "../../../documents/effect.mjs";
import type { ActiveEffectConfig } from "@client/applications/sheets/_module.mjs";
import type { TeriockSheet } from "../../mixins/_types";

declare module "./base-sheet.mjs" {
  export default interface TeriockBaseEffectSheet extends TeriockSheet, ActiveEffectConfig {
    effect: TeriockEffect;
    document: TeriockEffect;
  }
}