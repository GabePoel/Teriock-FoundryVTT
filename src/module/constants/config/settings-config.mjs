/**
 * Default values for configurable document settings.
 * @satisfies {Teriock.Config.SettingsConfig}
 */
export default {
  ability: { promptCostGp: true, promptCostHp: true, promptCostLp: true, promptCostMp: true, promptHeighten: true },
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
  },
  armament: { rollAttackOnUse: false, rollSecretly: false, rollTwoHanded: false },
};
