/**
 * Prepares level-based bonuses for the actor.
 * Calculates presence, rank, proficiency, and fluency bonuses based on level.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareBonuses(actorData) {
  const lvl = actorData.scaling.lvl;
  actorData.scaling.br = Math.max(
    ...actorData.parent.species.map((s) => s.system.br),
  );
  let scale = lvl;
  if (actorData.scaling.brScale) {
    scale = actorData.scaling.br;
  }
  actorData.scaling.scale = scale;
  actorData.presence = {
    min: 0,
    value: 0,
    max: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
  };
  actorData.scaling.rank = Math.max(0, Math.floor((lvl - 1) / 5));
  actorData.scaling.p = Math.max(0, Math.floor(1 + (scale - 7) / 10));
  actorData.scaling.f = Math.max(0, Math.floor((scale - 2) / 5));
}
