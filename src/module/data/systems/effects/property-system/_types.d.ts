declare global {
  namespace Teriock.Models {
    export interface PropertySystemInterface
      extends Teriock.Models.BaseEffectSystemInterface {
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
}

export {};
