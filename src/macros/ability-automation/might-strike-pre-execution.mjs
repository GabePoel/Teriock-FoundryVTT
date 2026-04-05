const act = scope.execution.activations.find((a) => a.type === "addDocuments");
const effectObject = act._source.primary.root.data;
const equipmentClass = await tm.dialogs.selectWeaponClassDialog();
const changesId = foundry.utils.randomID();
effectObject.system.automations[changesId] = {
  type: "changes",
  _id: changesId,
  changes: [
    {
      key: "system.damage",
      qualifier: `@class.${equipmentClass}`,
      target: "armament",
      value: "1d4[holy]",
      mode: 2,
      priority: 10,
    },
  ],
};
act._source.primary.root.data = effectObject;
act._source.secondary.root.data = effectObject;
