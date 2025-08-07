const options = foundry.utils.deepClone({
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
  noHeighten: true,
});
const spells = {
  flameRay: "Flame Ray",
  lightRay: "Light Ray",
  empathicRay: "Empathic Ray",
  deathRay: "Death Ray",
  lightningRay: "Lightning Ray",
  fireBall: "Fire Ball",
  medicineBall: "Medicine Ball",
  treeformBall: "Treeform Ball",
  terrorBall: "Terror Ball",
  iceBall: "Ice Ball",
};
const chosenAbilityName = await game.teriock.api.dialog.select(spells, {
  label: "Missile Spell",
  hint: "Please select a missile spell.",
  title: "Select Missile Spell",
});
const actor = scope.abilityData.actor;
const ability = await game.teriock.api.utils.importAbility(
  actor,
  spells[chosenAbilityName],
);
if (scope.abilityData.parent.isFluent) {
  await ability.update({
    "system.fluent": true,
  });
} else if (scope.abilityData.parent.isProficient) {
  await ability.update({
    "system.proficient": true,
  });
}
await ability.system.roll(options);
await ability.delete();
