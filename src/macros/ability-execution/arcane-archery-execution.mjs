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
/** @type {TeriockAbility[]} */
const spells = [];
for (const name of spellNames) {
  const spell = await game.teriock.api.utils.getAbility(name);
  spells.push(spell);
}
const spell = await game.teriock.api.dialog.selectDocument(spells, {
  title: "Select Spell",
  hint: "Select a spell to cast",
});
options.actor = scope.abilityData.actor;
await spell.system.roll(options);
