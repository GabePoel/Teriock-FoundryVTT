const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.rollConfig.useData.rollOptions);
const actor = data.rollConfig.abilityData.actor;
const equipment = actor.equipment.filter(
  (e) =>
    e.system.equipped &&
    e.system.damage &&
    e.system.damage !== "0" &&
    actor.system.wielding.attacker.raw !== e.id,
);
const selectedEquipment = await tm.dialogs.selectDocumentDialog(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to attack with.",
  },
);
const oldEquipmentId = actor.system.wielding.attacker.raw;
await actor.update({
  "system.wielding.attacker.raw": selectedEquipment.id,
});
const abilities = actor.abilities
  .filter(
    (a) =>
      a.system.interaction === "attack" &&
      a.system.maneuver === "active" &&
      a.system.executionTime === "a1" &&
      ["weapon", "hand"].includes(a.system.delivery.base),
  )
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await tm.dialogs.selectDocumentDialog(abilities, {
  title: "Select Ability",
  hint: "Select an ability to use.",
});
await ability.system.roll(options);
await actor.update({
  "system.wielding.attacker.raw": oldEquipmentId,
});
