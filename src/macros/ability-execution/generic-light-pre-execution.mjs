const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const lightedToUuids = await tm.dialogs.lightedToDialog();
const button = data.rollConfig.chatData.system.buttons.find(
  (b) => b.dataset.action === "apply-effect",
);

async function modifyData(data) {
  const effectObject = JSON.parse(data);
  effectObject.description = "<ul>";
  for (const uuid of lightedToUuids) {
    effectObject.changes.push({
      key: "system.lightedTo",
      value: uuid,
      mode: 2,
      priority: 10,
    });
    const token = await foundry.utils.fromUuid(uuid);
    effectObject.description += `<li>Lighted to @UUID[${uuid}]{${token.name}}</li>`;
  }
  effectObject.description += "</ul>";
  return JSON.stringify(effectObject);
}

button.dataset.normal = await modifyData(button.dataset.normal);
button.dataset.crit = await modifyData(button.dataset.crit);
