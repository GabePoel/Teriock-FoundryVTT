const validAbilities = actor.abilities
  .filter((a) => !a.isReference && a.system.standard)
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await tm.dialogs.selectDocumentDialog(validAbilities, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.title"),
});
if (ability) {
  const children = [{ uuid: ability.uuid }];
  const apply = scope.execution.activations.find(
    (a) => a.type === "addDocuments",
  );
  const data = apply.toObject();
  foundry.utils.setProperty(data, "primary.children", children);
  foundry.utils.setProperty(data, "secondary.children", children);
  scope.execution.activations = [
    new teriock.data.pseudoDocuments.activations.AddDocumentsActivation(data),
  ];
}
