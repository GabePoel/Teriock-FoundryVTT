/**
 * Default values for inheritable document settings.
 * @satisfies {Teriock.Config.SettingsConfig}
 */
export default {
  categories: {
    ability: {
      autoPayCosts: true,
      promptCostGp: true,
      promptCostHp: true,
      promptCostLp: true,
      promptCostMp: true,
      promptHeighten: true,
    },
    actor: {
      autoColoration: true,
      autoDetectionModes: true,
      autoLighting: true,
      autoMagic: true,
      autoScale: true,
      autoTransformation: true,
      autoVisionAngle: true,
      autoVisionModes: true,
      autoVisionRange: true,
      autoWound: true,
    },
    armament: { rollAttackOnUse: false, rollSecretly: false, rollTwoHanded: false },
    consumable: { consumeOnUse: true },
    equipment: { consumeAmmunition: false },
  },
  compositions: {
    ability: ["ability", "consumable"],
    actor: ["actor"],
    armament: ["armament"],
    consumable: ["consumable"],
    equipment: ["equipment", "armament", "consumable"],
  },
};
