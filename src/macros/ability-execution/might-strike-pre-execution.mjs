const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.rollConfig.chatData.system.buttons;
data.rollConfig.chatData.system.buttons = buttons.filter((button) => button.dataset.action === "apply-effect");
const button = data.rollConfig.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
effectObject.changes[0] = {
  key: `system.equipmentChanges.upgrades.classes.${equipmentClass}.damage`,
  value: "1d4[holy]",
  mode: 2,
  priority: 10,
};
const effectString = JSON.stringify(effectObject);
data.rollConfig.chatData.system.buttons[0].dataset.normal = effectString;
data.rollConfig.chatData.system.buttons[0].dataset.crit = effectString;
