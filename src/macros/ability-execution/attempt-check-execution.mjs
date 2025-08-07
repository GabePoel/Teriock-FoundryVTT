const options = foundry.utils.deepClone({
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
});
const actor = scope.abilityData.actor;
const tradecraft = await game.teriock.api.dialog.selectTradecraft();
await actor.rollTradecraft(tradecraft, options);
