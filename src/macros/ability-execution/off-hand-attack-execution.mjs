const options = foundry.utils.deepClone(scope.useData.rollOptions);
const actor = scope.abilityData.actor;
const equipment = actor.equipment.filter(
  (e) =>
    e.system.equipped &&
    e.system.damage &&
    e.system.damage !== "0" &&
    actor.system.wielding.attacker.raw !== e.id,
);
const selectedEquipmentUuids = await game.teriock.api.dialog.selectDocument(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to attack with.",
    multi: false,
    tooltip: true,
  },
);
const selectedEquipment = await foundry.utils.fromUuid(
  selectedEquipmentUuids[0],
);
const selectedEquipmentId = selectedEquipment.id;
const oldEquipmentId = actor.system.wielding.attacker.raw;
await actor.update({
  "system.wielding.attacker.raw": selectedEquipmentId,
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
const selectedAbilities = await game.teriock.api.dialog.selectDocument(
  abilities,
  {
    title: "Select Ability",
    hint: "Select an ability to use.",
    multi: false,
    tooltip: true,
  },
);
const ability = await foundry.utils.fromUuid(selectedAbilities[0]);
await ability.system.roll(options);
await actor.update({
  "system.wielding.attacker.raw": oldEquipmentId,
});
