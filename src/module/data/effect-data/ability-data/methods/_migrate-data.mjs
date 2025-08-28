import { parseDurationString } from "../../../../helpers/utils.mjs";
import { migrateHierarchy } from "../../../shared/migrations/migrate-hierarchy.mjs";

/**
 * Migrates ability data to the current schema version.
 * Handles data format conversions for effects, costs, and other ability properties.
 *
 * @param {object} data - The ability data to migrate.
 * @returns {Partial<TeriockAbilityData>} The migrated ability data.
 * @private
 */
export function _migrateData(data) {
  // Effect key migration
  if (data.effects?.includes("truth")) {
    data.effects = data.effects.map((effect) =>
      effect === "truth" ? "truthDetecting" : effect,
    );
  }
  if (data.effects?.includes("duelMod")) {
    data.effects = data.effects.map((effect) =>
      effect === "duelMod" ? "duelModifying" : effect,
    );
  }

  // HP and MP cost migration
  for (const pointCost of ["mp", "hp"]) {
    if (data.costs) {
      if (data.costs[pointCost] === null) {
        data.costs[pointCost] = {
          type: "none",
          value: {
            static: 0,
            formula: "",
            variable: "",
          },
        };
      }
      if (typeof data.costs[pointCost] == "string") {
        const variableCost = String(
          pointCost === "mp" ? "manaCost" : "hitCost",
        );
        data.costs[pointCost] = {
          type: "variable",
          value: {
            static: 0,
            formula: "",
            variable: variableCost || "",
          },
        };
      }
      if (typeof data.costs[pointCost] == "number") {
        data.costs[pointCost] = {
          type: "static",
          value: {
            static: Number(data.costs[pointCost]),
            formula: "",
            variable: "",
          },
        };
      }
      if (typeof data.costs[pointCost]?.value == "number") {
        data.costs[pointCost] = {
          type: "static",
          value: {
            static: data.costs[pointCost].value,
            formula: "",
            variable: "",
          },
        };
      }
      if (typeof data.costs[pointCost]?.value == "string") {
        data.costs[pointCost] = {
          type: "variable",
          value: {
            static: 0,
            formula: "",
            variable: String(data.costs[pointCost].value),
          },
        };
      }
    }

    // Duration migration
    if (typeof data.duration == "string") {
      data.duration = parseDurationString(data.duration);
    }
  }

  // Hierarchy migration
  data = migrateHierarchy(data);

  // Form migration
  if (foundry.utils.getProperty(data, "abilityType")) {
    foundry.utils.setProperty(
      data,
      "form",
      foundry.utils.getProperty(data, "abilityType"),
    );
  }
  return data;
}
