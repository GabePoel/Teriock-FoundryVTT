import { TeriockRoll } from "../../../../dice/_module.mjs";

/**
 * Prepares derived data for equipment by calculating the derived tier value.
 * Uses smart evaluation to compute the tier based on the raw tier formula and parent context.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data system to prepare derived data for.
 * @returns {void}
 * @private
 */
export function _prepareDerivedData(equipmentData) {
  if (equipmentData.consumable && equipmentData.quantity === 0) {
    equipmentData.equipped = false;
  }
  if (equipmentData.fightingStyle && equipmentData.fightingStyle.length > 0) {
    equipmentData.specialRules =
      TERIOCK.content.weaponFightingStyles[equipmentData.fightingStyle];
  }
  for (const damageOption of ["base", "twoHanded"]) {
    const key = `damage.${damageOption}.raw`;
    const damageRoll = new TeriockRoll(
      foundry.utils.getProperty(equipmentData, key),
    );
    damageRoll.terms.forEach((term) => {
      const flavorParts = new Set(
        term.flavor
          .toLowerCase()
          .split(" ")
          .map((p) => p.trim()),
      );
      flavorParts.delete("");
      if (equipmentData.powerLevel === "magic") {
        flavorParts.add("magic");
      }
      const flavorArray = Array.from(flavorParts);
      flavorArray.sort((a, b) => a.localeCompare(b));
      if (!term.isDeterministic) {
        term.options.flavor = flavorArray.join(" ");
      }
    });
    foundry.utils.setProperty(equipmentData, key, damageRoll.formula);
  }
}
