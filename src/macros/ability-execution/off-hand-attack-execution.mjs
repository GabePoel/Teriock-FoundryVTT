const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.rollConfig.useData.rollOptions);
const actor = data.rollConfig.useData.actor;
const equipment = actor.activeArmaments.filter(
  (e) =>
    e.system.damage.base.value &&
    e.system.damage.base.value !== "0" &&
    actor.system.primaryAttacker !== e.id,
);
const selectedEquipment = await tm.dialogs.selectDocumentDialog(equipment, {
  title: "Select Armament",
  hint: "Select armament to attack with.",
});
const oldEquipmentId = actor.system.primaryAttacker.id;
await actor.update({
  "system.wielding.attacker": selectedEquipment.id,
});
let abilities = await actor.allAbilities();
abilities = abilities
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
  "system.wielding.attacker": oldEquipmentId,
});
