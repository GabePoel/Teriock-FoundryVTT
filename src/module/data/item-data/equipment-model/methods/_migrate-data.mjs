//noinspection JSUnresolvedReference

/**
 * Migrates equipment data from older versions to the current format.
 * Converts numeric tier and maxQuantity values to the new schema format with raw and derived fields.
 * @param {object} data - The equipment data to migrate.
 * @returns {Partial<TeriockEquipmentModel>} The migrated equipment data.
 * @private
 */
export function _migrateData(data) {
  if (!Object.prototype.hasOwnProperty.call(data, "tier")) {
    if (!data.tier) {
      data.tier = "";
    }
    if (data.tier) {
      if (typeof data.tier === "string" || typeof data.tier === "number") {
        const rawTier = String(data.tier) || "";
        const derivedTier = Number(data.tier) || 0;
        data.tier = {
          raw: rawTier,
          derived: derivedTier,
        };
      }
    }
  }
  if (data.maxQuantity && typeof data.maxQuantity === "number") {
    const rawMaxQuantity = String(data.maxQuantity) || "";
    const derivedMaxQuantity = Number(data.maxQuantity) || 0;
    data.maxQuantity = {
      raw: rawMaxQuantity,
      derived: derivedMaxQuantity,
    };
  }
  if (typeof data.weight === "number") {
    data.weight = { saved: data.weight };
  }
  if (typeof data.av === "number") {
    data.av = { saved: data.av };
  }
  if (typeof data.bv === "number") {
    data.bv = { saved: data.bv };
  }
  if (typeof data.minStr === "number") {
    data.minStr = { saved: data.minStr };
  }
  if (foundry.utils.hasProperty(data, "sb")) {
    data.fightingStyle = data.sb;
  }
  if (
    foundry.utils.hasProperty(data, "damage") &&
    foundry.utils.getType(data.damage) === "string"
  ) {
    data.damage = { base: { saved: data.damage } };
  }
  if (
    foundry.utils.hasProperty(data, "twoHandedDamage") &&
    foundry.utils.getType(data.twoHandedDamage) === "string"
  ) {
    if (typeof data.damage !== "object") {
      data.damage = {};
    }
    data.damage.twoHanded = { saved: data.twoHandedDamage };
    foundry.utils.deleteProperty(data, "twoHandedDamage");
  }
  if (foundry.utils.hasProperty(data, "damageTypes")) {
    if (typeof data.damage !== "object") {
      data.damage = {};
      data.damage.types = data.damageTypes;
    }
  }
  if (typeof data.range === "string" || typeof data.range === "number") {
    data.range = { long: { saved: data.range } };
  }
  if (
    typeof data.shortRange === "string" ||
    typeof data.shortRange === "number"
  ) {
    if (typeof data.range !== "object") {
      data.range = {};
    }
    data.range.short = { saved: data.shortRange };
    foundry.utils.deleteProperty(data, "shortRange");
  }
  if (typeof data.ranged === "boolean") {
    if (typeof data.range !== "object") {
      data.range = {};
    }
    data.range.ranged = data.ranged;
    foundry.utils.deleteProperty(data, "ranged");
  }
  return data;
}
