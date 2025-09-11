const data = /** @type {Teriock.HookData.RollFeatSave} */ scope.data;
if ([
  "mov",
  "str",
].includes(data.attribute)) {
  data.options.advantage = true;
  const effect = actor.effects.getName("Bodyguard Backup Effect");
  await effect.delete();
}
