const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.rollConfig.chatData.system.buttons;
const applyButton = buttons.find((b) => b.label === "Apply Effect");
applyButton.label = "Apply Lighted";

const token = game.teriock.api.utils.actorToken(actor).document || actor;

function modifyData(data) {
  const effectObject = JSON.parse(data);
  effectObject.description = "<ul>";
  effectObject.changes.push({
    key: "system.lightedTo",
    value: token.uuid || actor.uuid,
    mode: 2,
    priority: 10,
  });
  effectObject.description += `<li>Lighted to @UUID[${token.uuid}]{${token.name}}</li>`;
  effectObject.description += "</ul>";
  return JSON.stringify(effectObject);
}

applyButton.dataset.normal = modifyData(applyButton.dataset.normal);
applyButton.dataset.crit = modifyData(applyButton.dataset.crit);
