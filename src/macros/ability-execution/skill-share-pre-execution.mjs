const buttons = scope.chatData.system.buttons;
scope.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.chatData.system.buttons[0];
const effectObject = JSON.parse(button.dataset.normal);

const allAbilities = actor.effectTypes?.ability || [];
const validAbilities = allAbilities.filter(
  (a) => !a.isReference && a.system.standard,
);
const validAbilityMap = {};
for (const validAbility of validAbilities) {
  validAbilityMap[validAbility.uuid] = validAbility.name;
}
const chosenAbilityUuid = await game.teriock.api.dialog.select(
  validAbilityMap,
  {
    label: "Ability",
    hint: "Select an ability to share.",
    title: "Select Ability",
  },
);
const chosenAbility = await foundry.utils.fromUuid(chosenAbilityUuid);
effectObject.system.hierarchy.rootUuid =
  chosenAbility.system.hierarchy.rootUuid;
effectObject.system.hierarchy.subIds = [chosenAbility.id];
const effectString = JSON.stringify(effectObject);
scope.chatData.system.buttons[0].dataset.normal = effectString;
scope.chatData.system.buttons[0].dataset.crit = effectString;
scope.chatData.system.proficient = false;
scope.chatData.system.fluent = false;
