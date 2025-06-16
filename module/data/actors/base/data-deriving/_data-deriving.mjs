import { _prepareAttributes, _prepareBonuses, _prepareHpMp, _preparePresence } from "./_prepare-stats.mjs";
import { _prepareDefenses, _prepareOffenses } from "./_prepare-combat.mjs";
import { _prepareEncumbrance, _prepareMoney, _prepareWeightCarried } from "./_prepare-load.mjs";
import { _prepareSize, _prepareVision } from "./_prepare-token.mjs";
import { _prepareTradecrafts } from "./_prepare-tradecrafts.mjs";

export function _prepareDerivedData(actor) {
  _prepareSize(actor);
  _prepareBonuses(actor);
  _prepareHpMp(actor);
  _preparePresence(actor);
  _prepareAttributes(actor);
  _prepareTradecrafts(actor);
  _prepareMoney(actor);
  _prepareWeightCarried(actor);
  _prepareDefenses(actor);
  _prepareOffenses(actor);
  _prepareEncumbrance(actor);
  _prepareVision(actor);
}