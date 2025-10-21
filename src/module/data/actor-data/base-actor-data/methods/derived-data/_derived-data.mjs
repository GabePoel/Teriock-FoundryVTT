import { _prepDerivedAttributes } from "./_prep-derived-attributes.mjs";
import { _prepDerivedMoney } from "./_prep-derived-load.mjs";
import { _prepDerivedSpeed } from "./_prep-derived-speed.mjs";
import { _prepDerivedTrackers } from "./_prep-derived-trackers.mjs";
import { _prepDerivedTradecrafts } from "./_prep-derived-tradecrafts.mjs";
import { _prepDerivedTransformation } from "./_prep-derived-transformation.mjs";

/**
 * Prepares all derived system data from other data.
 *
 * This function orchestrates the calculation of all derived properties that depend
 * on base data, equipment, and other factors. It ensures that all computed values
 * are up to date and consistent.
 *
 * The derived data includes:
 * - Attribute saves
 * - Combat relevant values (`av`, `bv`, `ac`, `cc`)
 * - Load and encumbrance calculations
 * - Token size and vision information
 * - Presence management
 * - Speed adjustments
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object
 * @private
 */
export function _prepareDerivedData(actorData) {
  _prepDerivedAttributes(actorData);
  _prepDerivedTradecrafts(actorData);
  _prepDerivedMoney(actorData);
  _prepDerivedSpeed(actorData);
  _prepDerivedTrackers(actorData);
  _prepDerivedTransformation(actorData);
}
