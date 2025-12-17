const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.execution.buttons;
data.execution.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = data.execution.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
effectObject.changes[0] = {
  key: `!equipment__system.equipmentClasses__has__${equipmentClass}__system.damage.base.raw`,
  value: "1d4[holy]",
  mode: 2,
  priority: 10,
};
const effectString = JSON.stringify(effectObject);
data.execution.buttons[0].dataset.normal = effectString;
data.execution.buttons[0].dataset.crit = effectString;
