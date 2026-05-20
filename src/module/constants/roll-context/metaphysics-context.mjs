const metaphysicsContext = {};
export default metaphysicsContext;

Hooks.once("i18nInit", () => {
  Object.entries(TERIOCK.reference.elements).forEach(([k, v]) => {
    metaphysicsContext[`element.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.element", { name: _loc(v) });
    metaphysicsContext[`element.${k.slice(0, 3).toLowerCase()}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.element", {
      name: _loc(v),
    });
  });
  Object.entries(TERIOCK.reference.effectTypes).forEach(([k, v]) => {
    metaphysicsContext[`effect.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.effectType", { name: _loc(v) });
  });
  Object.entries(TERIOCK.reference.powerSources).forEach(([k, v]) => {
    metaphysicsContext[`power.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.powerSource", { name: _loc(v) });
  });
  Hooks.call("teriock.i18nMetaphysicsInit");
});
