const buttons = scope.chatData.system.buttons;
scope.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);
const validAbilities = actor.abilities.filter(
  (a) => !a.isReference && a.system.standard,
);
const selectedAbilityUuids = await game.teriock.api.dialog.selectDocument(
  validAbilities,
  {
    title: "Select Ability",
    hint: "Select an ability to share.",
    multi: false,
    tooltip: true,
  },
);
const chosenAbility = await foundry.utils.fromUuid(selectedAbilityUuids[0]);
effectObject.system.hierarchy.rootUuid =
  chosenAbility.system.hierarchy.rootUuid;
effectObject.system.hierarchy.subIds = [chosenAbility.id];
const effectString = JSON.stringify(effectObject);
scope.chatData.system.buttons[0].dataset.normal = effectString;
scope.chatData.system.buttons[0].dataset.crit = effectString;
scope.chatData.system.proficient = false;
scope.chatData.system.fluent = false;
