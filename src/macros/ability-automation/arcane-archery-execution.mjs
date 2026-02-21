const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = {
  edge: data.execution.edge,
  actor: data.execution.actor,
  noHeighten: true,
};
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
  const spell = await tm.fetch.getAbility(name);
  spells.push(spell);
}
const spell = await tm.dialogs.selectDocumentDialog(spells, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Spell.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Spell.title"),
});
await spell.system.use(options);
