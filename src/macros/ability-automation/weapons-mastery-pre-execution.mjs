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
    _dep: game.teriock.getSetting("trackSustainedConsequences")
      ? scope.effect.uuid
      : undefined,
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

const activation =
  new teriock.data.pseudoDocuments.activations.AddDocumentsActivation({
    primary: { root: { data: consequenceData } },
  });
scope.execution.activations.push(activation);
