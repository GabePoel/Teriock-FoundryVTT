const data = /** @type {Teriock.HookData.EquipmentActivity} */ scope.data;
const equipment = data.doc;
if (equipment.name === "Spirit Item")
  await actor.toggleStatusEffect("dead", { active: true });
