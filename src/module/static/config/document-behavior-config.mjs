import { icons } from "../display/_module.mjs";

/**
 * Default values and display data for inheritable document settings.
 */
export default {
  categories: {
    ability: {
      icon: icons.manifest.document.ability,
      settings: { autoPayCosts: true, consumeAmmunition: true, consumeEquipment: false },
    },
    actor: {
      icon: icons.manifest.document.character,
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
      icon: icons.manifest.target.weapon,
      settings: { rollAttackOnUse: false, rollSecretly: false, rollTwoHanded: false },
    },
    consumable: { icon: icons.manifest.ui.quantity, settings: { consumeOnUse: true } },
    equipment: { icon: icons.manifest.document.equipment, settings: { consumeAmmunition: false } },
  },
  compositions: {
    ability: ["ability", "consumable"],
    actor: ["actor"],
    armament: ["armament"],
    consumable: ["consumable"],
    equipment: ["equipment", "armament", "consumable"],
  },
};
