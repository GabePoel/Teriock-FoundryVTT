const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = data.execution.options;
options.proficient = data.execution.proficient;
options.fluent = data.execution.fluent;
const spellNames = [
  "Fire Ball",
  "Medicine Ball",
  "Treeform Ball",
  "Terror Ball",
  "Ice Ball",
];
/** @type {TeriockAbility[]} */
const spells = [];
for (const name of spellNames) {
  const spell = await tm.fetch.getAbility(name);
  spells.push(spell);
}
const spell = await tm.dialogs.selectDocumentDialog(spells, {
  title: "Select Spell",
  hint: "Select a spell to cast",
});
await spell.system.roll(options);
