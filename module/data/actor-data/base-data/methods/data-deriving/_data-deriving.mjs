/** @import TeriockBaseActorData from "../../base-data.mjs"; */
import { _prepareAttributes, _prepareBonuses, _prepareHpMp, _preparePresence } from "./_prepare-stats.mjs";
import { _prepareDefenses, _prepareOffenses } from "./_prepare-combat.mjs";
import { _prepareEncumbrance, _prepareMoney, _prepareWeightCarried } from "./_prepare-load.mjs";
import { _prepareSize, _prepareVision } from "./_prepare-token.mjs";
import { _prepareTradecrafts } from "./_prepare-tradecrafts.mjs";

/**
 * Prepares all derived system data from base data.
 * @param {TeriockBaseActorData} system
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
  _prepareVision(system);
}
