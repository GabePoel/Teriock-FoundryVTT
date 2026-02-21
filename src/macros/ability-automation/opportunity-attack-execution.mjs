const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = data.execution.options;
const actor = data.execution.actor;
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
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.title"),
});
await ability.system.use(options);
