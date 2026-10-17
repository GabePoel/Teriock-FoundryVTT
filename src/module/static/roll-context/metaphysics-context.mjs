const metaphysicsContext = {};
export default metaphysicsContext;

Hooks.once("teriock.identifiersInit", () => {
  Object.entries(TERIOCK.CONFIG.metaphysics.elements).forEach(([k, v]) => {
    metaphysicsContext[`el.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.element", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.metaphysics.effectTypes).forEach(([k, v]) => {
    metaphysicsContext[`et.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.effectType", { name: v.label });
  });
  Object.entries(TERIOCK.CONFIG.metaphysics.powerSources).forEach(([k, v]) => {
    metaphysicsContext[`ps.${k}`] = _loc("TERIOCK.ROLL_CONTEXT.Ability.powerSource", { name: v.label });
  });
  Hooks.call("teriock.metaphysicsContextInit");
});
