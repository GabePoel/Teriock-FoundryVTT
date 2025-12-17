const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const ability = data.execution.source;
if (ability.isOwner && ability.actor && !ability.inCompendium) {
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
    "system.impacts.base.changes": changes,
  });
}
