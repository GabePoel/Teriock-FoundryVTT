function _prepareTradecraft(actor, key) {
  const tc = actor.system.tradecrafts[key];
  tc.bonus = (tc.proficient ? actor.system.p : 0) + tc.extra;
}

export function _prepareTradecrafts(actor) {
  for (const key of Object.keys(actor.system.tradecrafts)) {
    _prepareTradecraft(actor, key);
  }
}