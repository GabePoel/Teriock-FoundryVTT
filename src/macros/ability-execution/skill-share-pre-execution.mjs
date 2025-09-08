const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.rollConfig.chatData.system.buttons;
data.rollConfig.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = data.rollConfig.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const validAbilities = actor.abilities
  .filter((a) => !a.isReference && a.system.standard)
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await tm.dialogs.selectDocumentDialog(
  validAbilities,
  {
    title: "Select Ability",
    hint: "Select an ability to share.",
  },
);
effectObject.system.hierarchy.rootUuid = ability.system.hierarchy.rootUuid;
effectObject.system.hierarchy.subIds = [ability.id];
const effectString = JSON.stringify(effectObject);
data.rollConfig.chatData.system.buttons[0].dataset.normal = effectString;
data.rollConfig.chatData.system.buttons[0].dataset.crit = effectString;
data.rollConfig.chatData.system.proficient = false;
data.rollConfig.chatData.system.fluent = false;
