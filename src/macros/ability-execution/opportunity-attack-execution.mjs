const options = foundry.utils.deepClone(scope.useData.rollOptions);
const actor = scope.abilityData.actor;
const abilities = actor.abilities.filter(
  (a) =>
    a.system.interaction === "attack" &&
    a.system.maneuver === "active" &&
    a.system.executionTime === "a1" &&
    ["weapon", "hand"].includes(a.system.delivery.base),
);
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
