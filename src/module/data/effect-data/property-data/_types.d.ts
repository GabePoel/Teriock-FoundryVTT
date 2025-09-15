import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockProperty } from "../../../documents/_documents.mjs";
import type { EffectChangeData } from "../ability-data/types/consequences";
import type { HierarchyDataMixinInterface } from "../../mixins/hierarchy-data-mixin/_types";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyModel extends TeriockBaseEffectModel, HierarchyDataMixinInterface {
    /** Applies even if the parent {@link TeriockEquipment} is dampened */
    applyIfDampened: boolean;
    /** Applies even if the parent {@link TeriockEquipment} is shattered */
    applyIfShattered: boolean;
    /** Changes merged into overall changes */
    changes: EffectChangeData[];
    /** Damage type */
    damageType: string;
    /** Extra damage dealt by the parent {@link TeriockEquipment} */
    extraDamage: string;
    /** Property form */
    form: Teriock.Parameters.Shared.Form;
    /** Improvement description */
    improvement: string;
    /** Limitation description */
    limitation: string;
    /** Modifies the {@link TeriockActor} instead of the {@link TeriockEquipment} */
    modifiesActor: boolean;
    /** Power sources */
    powerSources: Teriock.Parameters.Ability.PowerSource[];

    get parent(): TeriockProperty;
  }
}
