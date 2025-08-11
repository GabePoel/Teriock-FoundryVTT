const buttons = scope.chatData.system.buttons;
scope.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const validAbilities = actor.abilities
  .filter((a) => !a.isReference && a.system.standard)
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await game.teriock.api.dialog.selectDocument(validAbilities, {
  title: "Select Ability",
  hint: "Select an ability to share.",
});
effectObject.system.hierarchy.rootUuid = ability.system.hierarchy.rootUuid;
effectObject.system.hierarchy.subIds = [ability.id];
const effectString = JSON.stringify(effectObject);
scope.chatData.system.buttons[0].dataset.normal = effectString;
scope.chatData.system.buttons[0].dataset.crit = effectString;
scope.chatData.system.proficient = false;
scope.chatData.system.fluent = false;
