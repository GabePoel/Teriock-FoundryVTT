/**
 * Migrates actor data to the current schema version.
 * Handles data format conversions and updates.
 * @param {object} data - The actor data to migrate.
 * @property {string | number} [weight]
 * @returns {object} The migrated actor data.
 * @private
 */
export function _migrateData(data) {
  if (typeof data?.weight === "string" && data?.weight.includes("lb")) {
    data.weight = parseFloat(data.weight.replace("lb", "").trim());
  }
  if (
    foundry.utils.getType(
      foundry.utils.getProperty(data, "wielding.attacker.raw"),
    ) === "string"
  ) {
    foundry.utils.setProperty(
      data,
      "wielding.attacker",
      foundry.utils.getProperty(data, "wielding.attacker.raw"),
    );
  } else if (
    foundry.utils.getType(
      foundry.utils.getProperty(data, "wielding.attacker"),
    ) === "Object"
  ) {
    foundry.utils.setProperty(data, "wielding.attacker", null);
  }
  if (
    foundry.utils.getType(
      foundry.utils.getProperty(data, "wielding.blocker.raw"),
    ) === "string"
  ) {
    foundry.utils.setProperty(
      data,
      "wielding.blocker",
      foundry.utils.getProperty(data, "wielding.blocker.raw"),
    );
  } else if (
    foundry.utils.getType(
      foundry.utils.getProperty(data, "wielding.blocker"),
    ) === "Object"
  ) {
    foundry.utils.setProperty(data, "wielding.blocker", null);
  }
  return data;
}
