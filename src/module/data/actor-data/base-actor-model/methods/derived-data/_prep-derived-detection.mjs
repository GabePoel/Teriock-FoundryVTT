import { deriveModifiableDeterministic } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare derived detection.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepDerivedDetection(actorData) {
  deriveModifiableDeterministic(actorData.detection.hiding, actorData.parent, {
    floor: true,
  });
  deriveModifiableDeterministic(
    actorData.detection.perceiving,
    actorData.parent,
    {
      floor: true,
    },
  );
  if (actorData.parent.statuses.has("ethereal")) {
    actorData.senses.etherealLight = Math.max(
      actorData.light.dim || 0,
      actorData.light.dark || 0,
    );
  } else {
    actorData.senses.etherealLight = 0;
  }
}
