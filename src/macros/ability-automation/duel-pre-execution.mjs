const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.execution.buttons;
const applyButton = buttons.find((b) => b.label === "Apply Effect");
applyButton.label = "Apply Lighted";

const token = actor?.defaultToken?.document || actor;

function modifyData(data) {
  const uuid = token.uuid || actor.uuid;
  const effectObject = JSON.parse(data);
  if (uuid) {
    effectObject.changes.push({
      key: "system.conditionInformation.lighted.trackers",
      value: tm.resolve.safeUuid(uuid),
      mode: 2,
      priority: 10,
    });
    effectObject.system.associations = [
      {
        title: "Lighted With Respect To",
        icon: TERIOCK.options.document.creature.icon,
        cards: [
          {
            name: token.name || actor.name,
            img: token.imageLive || actor.img,
            uuid: uuid,
            rescale: !!token.rescale,
            id: token.id || actor.id,
            type: "base",
          },
        ],
      },
    ];
  }
  return JSON.stringify(effectObject);
}

applyButton.dataset.normal = modifyData(applyButton.dataset.normal);
applyButton.dataset.crit = modifyData(applyButton.dataset.crit);
