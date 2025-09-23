const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const ability = data.rollConfig.abilityData.parent;
const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
const changes = [
  {
    key: `!equipment__system.equipmentClasses__has__${equipmentClass}__system.piercing.av0`,
    value: "true",
    mode: 5,
    priority: 10,
  },
];
await ability.update({
  "system.applies.base.changes": changes,
});
