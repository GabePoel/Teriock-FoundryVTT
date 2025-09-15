import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockProperty } from "../../../documents/_documents.mjs";
import type { HierarchyDataMixinInterface } from "../../mixins/hierarchy-data-mixin/_types";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyModel extends TeriockBaseEffectModel, HierarchyDataMixinInterface {
    /** <schema> Applies */
    applies: {
      /**
       * <schema> Changes made to the parent {@link TeriockEquipment} or {@link TeriockActor} if {@link modifiesActor}
       * is set to `true`.
       */
      changes: Teriock.Foundry.EffectChangeData[];
      /**
       * <schema> {@link TeriockMacro}s hooked to the parent {@link TeriockEquipment} or {@link TeriockActor} if
       * {@link modifiesActor} is set to `true`.
       */
      macros: Teriock.Parameters.Shared.MacroHookRecord;
    };
    /** <schema> Applies even if the parent {@link TeriockEquipment} is dampened */
    applyIfDampened: boolean;
    /** <schema> Applies even if the parent {@link TeriockEquipment} is shattered */
    applyIfShattered: boolean;
    /** <schema> Damage type */
    damageType: string;
    /** <schema> Extra damage dealt by the parent {@link TeriockEquipment} */
    extraDamage: string;
    /** <schema> Property form */
    form: Teriock.Parameters.Shared.Form;
    /** <schema> Improvement description */
    improvement: string;
    /** <schema> Limitation description */
    limitation: string;
    /** <schema> Modifies the {@link TeriockActor} instead of the {@link TeriockEquipment} */
    modifiesActor: boolean;
    /** <schema> Power sources */
    powerSources: Teriock.Parameters.Ability.PowerSource[];

    get parent(): TeriockProperty;
  }
}
