/** @import TeriockBaseActorData from "../../base-actor-data.mjs"; */
import { _prepareAttributes, _prepareBonuses, _prepareHpMp, _preparePresence } from "./_prepare-stats.mjs";
import { _prepareDefenses, _prepareOffenses } from "./_prepare-combat.mjs";
import { _prepareEncumbrance, _prepareMoney, _prepareWeightCarried } from "./_prepare-load.mjs";
import { _prepareSize } from "./_prepare-token.mjs";
import { _prepareSpeed } from "./_prepare-speed.mjs";
import { _prepareTradecrafts } from "./_prepare-tradecrafts.mjs";

/**
 * Prepares all derived system data from base data.
 *
 * This function orchestrates the calculation of all derived properties that depend
 * on base data, equipment, and other factors. It ensures that all computed values
 * are up-to-date and consistent.
 *
 * The derived data includes:
 * - Level-based bonuses (pres, rank, p, f)
 * - Attribute saves (intSave, movSave, etc.)
 * - Combat values (av, bv, ac, cc)
 * - Load and encumbrance calculations
 * - Token size and vision information
 * - Presence management
 * - Speed adjustments
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object
 * @returns {void} Modifies the system object in place with derived data
 *
 * @example
 * // Calculate all derived data for an actor
 * _prepareDerivedData(actor.system);
 */
export function _prepareDerivedData(system) {
  _prepareSize(system);
  _prepareBonuses(system);
  _prepareHpMp(system);
  _preparePresence(system);
  _prepareAttributes(system);
  _prepareTradecrafts(system);
  _prepareMoney(system);
  _prepareWeightCarried(system);
  _prepareDefenses(system);
  _prepareOffenses(system);
  _prepareEncumbrance(system);
  _prepareSpeed(system);
}
