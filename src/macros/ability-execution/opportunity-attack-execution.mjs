const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.rollConfig.useData.rollOptions);
const actor = data.rollConfig.useData.actor;
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
