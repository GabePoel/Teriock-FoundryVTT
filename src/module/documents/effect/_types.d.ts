import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";
import { TeriockActor } from "../_module.mjs";
import { BaseEffectSheet } from "../../applications/sheets/effect-sheets/_module.mjs";

declare module "./effect.mjs" {
  export default interface TeriockEffect
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    disabled: boolean;
    parent: TeriockParent;
    sheet: BaseEffectSheet;
    system: BaseEffectSystem;

    get actor(): TeriockActor;
    get documentName(): "ActiveEffect";
  }
}
