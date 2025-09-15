const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const goadedToUuids = await tm.dialogs.goadedToDialog();
const buttons = data.rollConfig.chatData.system.buttons;
data.rollConfig.chatData.system.buttons = buttons.filter((button) => button.dataset.action === "apply-effect");
const button = data.rollConfig.chatData.system.buttons[0];

async function modifyData(data) {
  const effectObject = JSON.parse(data);
  effectObject.description = "<ul>";
  for (const uuid of goadedToUuids) {
    effectObject.changes.push({
      key: "system.trackers.goadedTo",
      value: uuid,
      mode: 2,
      priority: 10,
    });
    const token = await foundry.utils.fromUuid(uuid);
    effectObject.description += `<li>Goaded to @UUID[${uuid}]{${token.name}}</li>`;
  }
  effectObject.description += "</ul>";
  return JSON.stringify(effectObject);
}

button.dataset.normal = await modifyData(button.dataset.normal);
button.dataset.crit = await modifyData(button.dataset.crit);
