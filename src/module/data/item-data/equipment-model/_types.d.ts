declare module "./equipment-model.mjs" {
  export default interface TeriockEquipmentModel {
    /** <schema> Damage Dice */
    damage: {
      /** <schema> Damage this always deals */
      base: Teriock.Fields.ModifiableIndeterministic;
      /** <schema> Damage this deals in two hands */
      twoHanded: Teriock.Fields.ModifiableIndeterministic;
      /** <schema> Additional damage types to be added to all the base damage */
      types: Set<string>;
    };
    /** <schema> Is the equipment dampened? */
    dampened: boolean;
    /** <schema> Equipment Classes */
    equipmentClasses: Set<Teriock.Parameters.Equipment.EquipmentClass>;
    /** <schema> Canonical Equipment Type */
    equipmentType: string;
    /** <schema> Is the equipment equipped? */
    equipped: boolean;
    /** <base> Is the equipment glued? */
    glued: boolean;
    /** <base> Registered pseudo-hook macros to fire */
    hookedMacros: Teriock.Parameters.Equipment.HookedEquipmentMacros;
    /** <schema.> Identification info */
    identification: {
      /** <schema> Secret flaws for when this is identified */
      flaws: string;
      /** <schema> Is the equipment identified? */
      identified: boolean;
      /** <schema> Secret name for when this is identified */
      name: string;
      /** <schema> Secret notes for when this is identified */
      notes: string;
      /** <schema> Secret power level */
      powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
      /** <schema> Whether magic has been read on this */
      read: boolean;
    };
    /** <schema> Minimum STR */
    minStr: Teriock.Fields.ModifiableNumber;
    /** <schema> Power Level */
    powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
    /** <schema> Price */
    price: number;
    /** <schema> Is the equipment shattered? */
    shattered: boolean;
    /** <schema> Presence Tier */
    tier: Teriock.Fields.ModifiableDeterministic;
    /** <schema> Weight (lb) */
    weight: Teriock.Fields.ModifiableNumber & {
      /** <special> Weight times quantity */
      total: number;
    };

    get parent(): TeriockEquipment;
  }
}

export {};
