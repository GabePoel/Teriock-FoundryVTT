import { prepareModifiableBase } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare base detection.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseDetection(actorData) {
  if (
    !actorData.detection.hiding.saved ||
    actorData.detection.hiding.saved.length === 0
  ) {
    actorData.detection.hiding.saved = "@snk.pas";
  }
  if (
    !actorData.detection.perceiving.saved ||
    actorData.detection.perceiving.saved.length === 0
  ) {
    actorData.detection.perceiving.saved = "@per.pas";
  }
  prepareModifiableBase(actorData.detection.hiding);
  prepareModifiableBase(actorData.detection.perceiving);
}
