const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.rollConfig.chatData.system.buttons;
const applyButton = buttons.find((b) => b.label === "Apply Effect");

const choices = {
  awakening: "Awakening",
  control: "Control",
  displacement: "Displacement",
  duelModifying: "Duel modifying",
  financial: "Financial",
  healing: "Healing",
  killing: "Killing",
  knockout: "Knockout",
  loud: "Loud",
  mental: "Mental",
  poison: "Poison",
  reanimation: "Reanimation",
  regeneration: "Regeneration",
  revitalization: "Revitalization",
  revival: "Revival",
  stealing: "Stealing",
  summoning: "Summoning",
  temporal: "Temporal",
  transformation: "Transformation",
  truthDetecting: "Truth detecting",
};

const documents = Object.keys(choices).map((key) => {
  return {
    img: tm.path.getIcon("effect-types", choices[key]),
    name: choices[key],
    uuid: key,
  };
});

const choice = await tm.dialogs.selectDocumentDialog(documents, {
  hint: "Select an effect type to resist.",
});

function modifyData(data) {
  const effectObject = JSON.parse(data);
  effectObject.changes.push({
    key: "system.protections.resistances.effects",
    value: choice.uuid,
    mode: 2,
    priority: 10,
  });
  return JSON.stringify(effectObject);
}

applyButton.dataset.normal = modifyData(applyButton.dataset.normal);
applyButton.dataset.crit = modifyData(applyButton.dataset.crit);
