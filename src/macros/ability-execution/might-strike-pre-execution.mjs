const buttons = scope.chatData.system.buttons;
scope.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const equipmentClass = await game.teriock.api.dialog.selectWeaponClass();
effectObject.changes[0] = {
  key: `system.equipmentChanges.upgrades.classes.${equipmentClass}.damage`,
  value: "1d4[holy]",
  mode: 2,
  priority: 10,
};
const effectString = JSON.stringify(effectObject);
scope.chatData.system.buttons[0].dataset.normal = effectString;
scope.chatData.system.buttons[0].dataset.crit = effectString;
