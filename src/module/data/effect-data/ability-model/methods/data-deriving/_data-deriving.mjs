/**
 * Poor workaround to allow for subs to be accessible for effect duplication.
 * @param {TeriockAbilityModel} abilityData
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(abilityData) {
  // Derived costs
  if (abilityData.invoked) {
    abilityData.costs.somatic = true;
    abilityData.costs.verbal = true;
  }

  // Gifted modifications
  if (abilityData.gifted.enabled) {
    abilityData.form = "gifted";
    if (abilityData.maneuver === "passive") {
      abilityData.maneuver = "active";
      abilityData.executionTime = "a1";
      abilityData.duration.unit = "minute";
      abilityData.duration.quantity = 1;
      abilityData.duration.description = "1 Minute";
    }
  }

  // Base duration
  const finiteUnits = {
    instant: 0,
    second: 1,
    minute: 60,
    hour: 60 * 60,
    day: 60 * 60 * 24,
    week: 60 * 60 * 24 * 7,
    month: (60 * 60 * 24 * 365) / 12,
    year: 60 * 60 * 24 * 365,
  };
  let baseDuration = 0;
  if (Object.keys(finiteUnits).includes(abilityData.duration.unit)) {
    baseDuration =
      finiteUnits[abilityData.duration.unit] * abilityData.duration.quantity;
  }
  abilityData.impacts.base.duration = baseDuration;

  // Effect match power sources
  for (const ps of abilityData.powerSources) {
    if (
      Object.keys(TERIOCK.index.effectTypes).includes(ps) &&
      !abilityData.effectTypes.has(ps)
    ) {
      abilityData.effectTypes.add(ps);
    }
  }

  // Compute changes
  let applyChanges = abilityData.maneuver === "passive";
  for (const status of abilityData.duration.conditions.present) {
    if (!abilityData.actor?.statuses.has(status)) {
      applyChanges = false;
    }
  }
  for (const status of abilityData.duration.conditions.absent) {
    if (abilityData.actor?.statuses.has(status)) {
      applyChanges = false;
    }
  }
  if (applyChanges) {
    abilityData.parent.changes = abilityData.changes;
  }

  if (abilityData.improvements.attributeImprovement.attribute) {
    const att = abilityData.improvements.attributeImprovement.attribute;
    const minVal = abilityData.improvements.attributeImprovement.minVal;
    abilityData.improvements.attributeImprovement.text =
      `This ability sets your @L[Core:${att.toUpperCase()}] score ` +
      `to a minimum of ${minVal}.`;
  } else {
    abilityData.improvements.attributeImprovement.text = "";
  }

  if (abilityData.improvements.featSaveImprovement.attribute) {
    const att = abilityData.improvements.featSaveImprovement.attribute;
    const amount = abilityData.improvements.featSaveImprovement.amount;
    const amountVal = TERIOCK.options.ability.featSaveImprovementAmount[amount];
    abilityData.improvements.featSaveImprovement.text =
      `This ability gives you @L[Core:${amountVal} Bonus]{${amount}} in ` +
      `@L[Core:${att.toUpperCase()}] @L[Core:Feat Interaction]{feat saves}.`;
  } else {
    abilityData.improvements.featSaveImprovement.text = "";
  }

  if (abilityData.grantOnly) {
    abilityData.grantOnlyText = `This ability can only be used with @UUID[${abilityData.parent.parent.uuid}].`;
  } else {
    abilityData.grantOnlyText = "";
  }
}
