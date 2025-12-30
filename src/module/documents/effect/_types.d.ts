import { TeriockBaseEffectModel } from "../../data/effect-data/_module.mjs";
import { TeriockActor } from "../_module.mjs";
import { TeriockBaseEffectSheet } from "../../applications/sheets/effect-sheets/_module.mjs";

declare module "./effect.mjs" {
  export default interface TeriockEffect
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    parent: TeriockParent;
    sheet: TeriockBaseEffectSheet;
    system: TeriockBaseEffectModel;

    get actor(): TeriockActor;
    get documentName(): "ActiveEffect";
  }
}

export {};
