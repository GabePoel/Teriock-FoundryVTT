import type TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type { TeriockProperty } from "../../../documents/_documents.mjs";
import type { EffectChangeData } from "../ability-data/types/consequences";

declare module "./property-data.mjs" {
  export default interface TeriockPropertyData extends TeriockBaseEffectData {
    /** Property form */
    form: Teriock.Parameters.Shared.Form;
    /** Power sources */
    powerSources: Teriock.Parameters.Ability.PowerSource[];
    /** Damage type */
    damageType: string;
    /** Extra damage dealt by the parent {@link TeriockEquipment} */
    extraDamage: string;
    /** Applies even if the parent {@link TeriockEquipment} is shattered */
    applyIfShattered: boolean;
    /** Applies even if the parent {@link TeriockEquipment} is dampened */
    applyIfDampened: boolean;
    /** Modifies the {@link TeriockActor} instead of the {@link TeriockEquipment} */
    modifiesActor: boolean;
    /** Changes merged into overall changes */
    changes: EffectChangeData[];

    get parent(): TeriockProperty;
  }
}
