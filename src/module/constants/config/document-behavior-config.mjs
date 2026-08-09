import { icons } from "../display/icons.mjs";

/**
 * Default values and display data for inheritable document settings.
 */
export default {
  categories: {
    ability: {
      icon: icons.document.ability,
      settings: { autoPayCosts: true, consumeAmmunition: true, consumeEquipment: false },
    },
    actor: {
      icon: icons.document.character,
      settings: {
        autoColoration: true,
        autoDetectionModes: true,
        autoEncumbrance: true,
        autoLighting: true,
        autoScale: true,
        autoTransformation: true,
        autoVisionAngle: true,
        autoVisionModes: true,
        autoVisionRange: true,
        autoWound: true,
      },
    },
    armament: {
      icon: icons.target.weapon,
      settings: { rollAttackOnUse: false, rollSecretly: false, rollTwoHanded: false },
    },
    consumable: { icon: icons.ui.quantity, settings: { consumeOnUse: true } },
    equipment: { icon: icons.document.equipment, settings: { consumeAmmunition: false } },
  },
  compositions: {
    ability: ["ability", "consumable"],
    actor: ["actor"],
    armament: ["armament"],
    consumable: ["consumable"],
    equipment: ["equipment", "armament", "consumable"],
  },
};
