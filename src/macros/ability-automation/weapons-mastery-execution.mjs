const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const ability = data.execution.source;
if (ability.isOwner && ability.actor && !ability.inCompendium) {
  const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
  const changes = [
    {
      key: "system.piercing.raw",
      mode: 4,
      priority: 10,
      qualifier: `@class.${equipmentClass}`,
      target: "equipment",
      time: "normal",
      value: "1",
    },
  ];
  await ability.update({
    "system.impacts.base.changes": changes,
  });
}
