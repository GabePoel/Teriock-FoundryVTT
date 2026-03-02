const equipmentClass = await tm.dialogs.selectEquipmentClassDialog();
const changesId = foundry.utils.randomID();
const consequenceData = {
  name: game.i18n
    .format("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", {
      name: scope.effect?.name || "",
    })
    .trim(),
  img: scope.effect?.img,
  system: {
    automations: {
      [changesId]: {
        type: "changes",
        _id: changesId,
        changes: [
          {
            key: "system.piercing.raw",
            mode: 4,
            priority: 10,
            qualifier: `@class.${equipmentClass}`,
            target: "armament",
            time: "normal",
            value: "1",
          },
        ],
      },
    },
  },
  type: "consequence",
};
const button = teriock.helpers.interaction.buttonHandlers[
  "apply-effect"
].buildButton(consequenceData, { sustainingAbility: scope.effect });
scope.execution.buttons.push(button);
