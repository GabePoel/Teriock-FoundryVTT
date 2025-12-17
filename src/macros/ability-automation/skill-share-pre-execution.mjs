const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.execution.buttons;
data.execution.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const validAbilities = actor.abilities
  .filter((a) => !a.isReference && a.system.standard)
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await tm.dialogs.selectDocumentDialog(validAbilities, {
  title: "Select Ability",
  hint: "Select an ability to share.",
});
data.execution.buttons[0].dataset.bonusSubs = JSON.stringify([ability.uuid]);
data.execution.proficient = false;
data.execution.fluent = false;
