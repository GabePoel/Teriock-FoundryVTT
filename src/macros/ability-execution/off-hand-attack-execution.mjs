const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = data.execution.options;
const actor = data.execution.actor;
const armaments = actor.activeArmaments.filter(
  (e) => e.system.damage.base.nonZero && actor.system.primaryAttacker !== e.id,
);
if (armaments.length > 0) {
  const selectedArmament = await tm.dialogs.selectDocumentDialog(armaments, {
    title: "Select Armament",
    hint: "Select armament to attack with.",
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
  options.armament = selectedArmament;
  await ability.system.roll(options);
}
