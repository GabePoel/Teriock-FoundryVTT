const goadedToUuids = await game.teriock.api.dialog.goadedTo();
const buttons = scope.chatData.system.buttons;
scope.chatData.system.buttons = buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = scope.chatData.system.buttons[0];

async function modifyData(data) {
  const effectObject = JSON.parse(data);
  effectObject.description = "<ul>";
  for (const uuid of goadedToUuids) {
    effectObject.changes.push({
      key: "system.goadedTo",
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
