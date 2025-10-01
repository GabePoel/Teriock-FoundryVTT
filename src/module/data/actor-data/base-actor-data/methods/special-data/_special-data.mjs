import { _prepSpecialDefense } from "./_prep-special-defense.mjs";
import {
  _prepSpecialEncumbrance,
  _prepSpecialWeightCarried,
} from "./_prep-special-load.mjs";

/**
 * Prepares data that happens after actor effects are applied to items.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepareSpecialData(actorData) {
  _prepSpecialWeightCarried(actorData);
  _prepSpecialEncumbrance(actorData);
  _prepSpecialDefense(actorData);
}
