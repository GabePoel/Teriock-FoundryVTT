const options = foundry.utils.deepClone(scope.useData.rollOptions);
options.noHeighten = true;
const spellNames = [
  "Flame Ray",
  "Light Ray",
  "Empathic Ray",
  "Death Ray",
  "Lightning Ray",
  "Fire Ball",
  "Medicine Ball",
  "Treeform Ball",
  "Terror Ball",
  "Ice Ball",
];
const spells = [];
for (const name of spellNames) {
  const spell = await game.teriock.api.utils.getAbility(name);
  spells.push(spell);
}
const spell = await game.teriock.api.dialog.selectDocument(spells, {
  title: "Select Spell",
  hint: "Select a spell to cast",
});
const actor = scope.abilityData.actor;
const ability = await game.teriock.api.utils.importAbility(actor, spell.name);
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
