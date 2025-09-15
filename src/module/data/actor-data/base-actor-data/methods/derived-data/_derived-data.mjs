import { _prepareDerivedAttributes } from "./_prep-derived-attributes.mjs";
import { _prepareDefenses, _prepareOffenses } from "./_prep-derived-combat.mjs";
import { _prepareDerivedHpMp } from "./_prep-derived-hp-mp.mjs";
import { _prepareEncumbrance, _prepareMoney, _prepareWeightCarried } from "./_prep-derived-load.mjs";
import { _prepareSpecies } from "./_prep-derived-species.mjs";
import { _prepareSpeed } from "./_prep-derived-speed.mjs";
import { _prepareTradecrafts } from "./_prep-derived-tradecrafts.mjs";

/**
 * Prepares all derived system data from other data.
 *
 * This function orchestrates the calculation of all derived properties that depend
 * on base data, equipment, and other factors. It ensures that all computed values
 * are up to date and consistent.
 *
 * The derived data includes:
 * - Attribute saves (`intSave`, `movSave`, etc.)
 * - Combat values (`av`, `bv`, `ac`, `cc`)
 * - Load and encumbrance calculations
 * - Token size and vision information
 * - Presence management
 * - Speed adjustments
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @returns {void} Modifies the system object in place with derived data
 */
export function _prepareDerivedData(actorData) {
  _prepareSpecies(actorData);
  _prepareDerivedAttributes(actorData);
  _prepareTradecrafts(actorData);
  _prepareMoney(actorData);
  _prepareWeightCarried(actorData);
  _prepareDefenses(actorData);
  _prepareOffenses(actorData);
  _prepareEncumbrance(actorData);
  _prepareSpeed(actorData);
  _prepareDerivedHpMp(actorData);
}
