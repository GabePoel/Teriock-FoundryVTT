const options = scope.execution.options;
options.proficient = scope.execution.proficient;
options.fluent = scope.execution.fluent;
const spellNames = [
  "Flame Ray",
  "Light Ray",
  "Empathic Ray",
  "Death Ray",
  "Lightning Ray",
];
/** @type {TeriockAbility[]} */
const spells = [];
for (const name of spellNames) {
  const spell = await tm.fetch.getAbility(name);
  spells.push(spell);
}
const spell = await tm.dialogs.selectDocumentDialog(spells, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Spell.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Spell.title"),
});
await spell.system.use(options);
