const options = foundry.utils.deepClone({
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
});
const actor = scope.abilityData.actor;
const abilities = {};
actor.abilities
  .filter(
    (a) =>
      a.system.interaction === "attack" &&
      a.system.maneuver === "active" &&
      a.system.executionTime === "a1" &&
      ["weapon", "hand"].includes(a.system.delivery.base),
  )
  .map((a) => (abilities[a.id] = a.name));
const id = await game.teriock.api.dialog.select(abilities, {
  label: "Ability",
  hint: "Please select an ability.",
  title: "Select Ability",
});
const ability = actor.abilities.find((a) => a.id === id);
Hooks.once("renderChatMessageHTML", async () => {
  await ability.system.roll(options);
});
