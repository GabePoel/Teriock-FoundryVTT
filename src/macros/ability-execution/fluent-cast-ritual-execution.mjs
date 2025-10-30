const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.rollConfig.useData.rollOptions);
options.proficient = data.rollConfig.useData.proficient;
options.fluent = data.rollConfig.useData.fluent;
const spellNames = [
  "Self Detonate",
  "Resurrect",
  "Oracle",
  "Summon the Dead",
  "Identify",
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
options.actor = data.rollConfig.abilityData.actor;
await spell.system.roll(options);
