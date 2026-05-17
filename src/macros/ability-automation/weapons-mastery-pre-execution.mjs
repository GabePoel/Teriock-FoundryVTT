const equipmentClass = await tm.dialogs.selectEquipmentClassDialog();
const childChangeId = foundry.utils.randomID();
const consequenceData = {
  img: scope.effect?.img,
  name: game.i18n
    .format("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", {
      name: scope.effect?.name || "",
    })
    .trim(),
  system: {
    _dep: game.teriock.getSetting("trackSustainedConsequences") ? scope.effect.uuid : undefined,
    automations: {
      [childChangeId]: {
        _id: childChangeId,
        category: "armament",
        changeType: "upgrade",
        key: "system.piercing.raw",
        qualifier: `@class.${equipmentClass}`,
        type: "childChange",
        value: "1",
      },
    },
  },
  type: "consequence",
};

const activation = new teriock.data.pseudoDocuments.activations.AddDocumentsActivation({
  primary: { root: { data: consequenceData } },
});
scope.execution.activations.push(activation);
