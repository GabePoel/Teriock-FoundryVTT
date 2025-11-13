import { pureUuid } from "../../../../helpers/utils.mjs";

/**
 * Generates an array of changes from ability data based on proficiency level.
 * Does not include heightened change data.
 * @param {TeriockAbilityModel} abilityData - The ability data to generate the changes from.
 * @returns {EffectChangeData[]}
 * @private
 */
export function _generateChanges(abilityData) {
  /** @type {EffectChangeData[]} */
  const changes = [];
  if (abilityData.impacts.base.changes.length > 0) {
    changes.push(...abilityData.impacts.base.changes);
  }
  if (
    abilityData.parent.isProficient &&
    abilityData.impacts.proficient.changes.length > 0
  ) {
    changes.push(...abilityData.impacts.proficient.changes);
  }
  if (
    abilityData.parent.isFluent &&
    abilityData.impacts.fluent.changes.length > 0
  ) {
    changes.push(...abilityData.impacts.fluent.changes);
  }
  if (abilityData.improvements.attributeImprovement.attribute) {
    const attributeImprovementChange = {
      key: `system.attributes.${abilityData.improvements.attributeImprovement.attribute}.score.raw`,
      value: abilityData.improvements.attributeImprovement.minVal,
      mode: 4,
      priority: 20,
    };
    changes.push(attributeImprovementChange);
  }
  if (abilityData.improvements.featSaveImprovement.attribute) {
    const amount = abilityData.improvements.featSaveImprovement.amount;
    const saveKey = amount === "fluency" ? "saveFluent" : "saveProficient";
    const featSaveImprovementChange = {
      key: `system.attributes.${abilityData.improvements.featSaveImprovement.attribute}.${saveKey}`,
      value: true,
      mode: 4,
      priority: 20,
    };
    changes.push(featSaveImprovementChange);
  }
  for (const [safeUuid, pseudoHook] of Object.entries(
    abilityData.impacts.macros,
  )) {
    const change = {
      key: `system.hookedMacros.${pseudoHook}`,
      value: pureUuid(safeUuid),
      mode: 2,
      priority: 5,
    };
    changes.push(change);
  }
  return foundry.utils.deepClone(changes);
}
