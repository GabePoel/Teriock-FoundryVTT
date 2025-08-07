const args = scope.args;
if (["mov", "str"].includes(args[0])) {
  args[1]["advantage"] = true;
  const effect = actor.effects.getName("Bodyguard Backup Effect");
  await effect.delete();
}
