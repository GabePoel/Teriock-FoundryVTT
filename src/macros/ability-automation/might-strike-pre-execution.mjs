const buttons = scope.execution.buttons;
scope.execution.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.execution.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
const changesId = foundry.utils.randomID();
effectObject.system.automations[changesId] = {
  type: "changes",
  _id: changesId,
  changes: [
    {
      key: "system.damage.all.raw",
      qualifier: `@class.${equipmentClass}`,
      target: "armament",
      value: "1d4[holy]",
      mode: 2,
      priority: 10,
    },
  ],
};
const effectString = JSON.stringify(effectObject);
scope.execution.buttons[0].dataset.normal = effectString;
scope.execution.buttons[0].dataset.crit = effectString;
