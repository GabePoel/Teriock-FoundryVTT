const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const buttons = data.execution.buttons;
const applyButton = buttons.find((b) => b.dataset.action === "apply-effect");
applyButton.label = game.i18n.format("TERIOCK.COMMANDS.Status.applyNamed", {
  name: TERIOCK.reference.conditions.lighted,
});

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
        title: game.i18n.format(
          "TERIOCK.SYSTEMS.Ability.PANELS.statusWithRespectTo",
          { status: TERIOCK.reference.conditions.lighted },
        ),
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
