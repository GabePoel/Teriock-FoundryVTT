const options = foundry.utils.deepClone(scope.useData.rollOptions);
const actor = scope.abilityData.actor;
const abilities = actor.abilities
  .filter(
    (a) =>
      a.system.interaction === "attack" &&
      a.system.maneuver === "active" &&
      a.system.executionTime === "a1" &&
      ["weapon", "hand"].includes(a.system.delivery.base),
  )
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await game.teriock.api.dialogs.selectDocumentDialog(abilities, {
  title: "Select Ability",
  hint: "Select an ability to use.",
});
await ability.system.roll(options);
