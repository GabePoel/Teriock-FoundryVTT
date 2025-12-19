declare global {
  namespace Teriock.Models {
    export interface TeriockPropertyModelInterface
      extends Teriock.Models.TeriockBaseEffectModelInterface {
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
      /** <schema> Impacts */
      impacts: {
        /** <schema> Changes made to the parent {@link TeriockEquipment} and {@link TeriockActor}). */
        changes: Teriock.Foundry.EffectChangeData[];
        /**
         * <schema> {@link TeriockMacro}s hooked to the parent {@link TeriockEquipment} or {@link TeriockActor} if
         * {@link modifiesActor} is set to `true`.
         */
        macros: Teriock.Parameters.Shared.MacroHookRecord;
      };
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
}

export {};
