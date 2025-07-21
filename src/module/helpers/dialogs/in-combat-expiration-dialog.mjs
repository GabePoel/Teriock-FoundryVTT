const { api, ux } = foundry.applications;
import TeriockRoll from "../../documents/roll.mjs";

/**
 * Dialog that asks the {@link TeriockUser} if their effect should expire.
 *
 * @param {TeriockLingeringEffect} effect
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationDialog(effect) {
  if (effect.system.expirations.combat.what.type === "none") return;
  let expire = false;
  if (effect.system.expirations.combat.what.type === "forced") {
    expire = await api.DialogV2.confirm({
      window: { title: `${effect.name} Expiration` },
      content: `Should ${effect.name} expire?`,
      modal: true,
      rejectClose: false,
    });
  } else if (effect.system.expirations.combat.what.type === "rolled") {
    const contentHtml = document.createElement("div");
    if (effect.system.expirations.description) {
      const descriptionElement = document.createElement("fieldset");
      const descriptionLegend = document.createElement("legend");
      descriptionLegend.innerText = "End Condition";
      descriptionElement.append(descriptionLegend);
      const descriptionText = await ux.TextEditor.enrichHTML(effect.system.expirations.description);
      const descriptionDiv = document.createElement("div");
      descriptionDiv.innerHTML = descriptionText;
      descriptionElement.append(descriptionDiv);
      contentHtml.append(descriptionElement);
    }
    contentHtml.append(
      effect.system.schema.fields.expiration.fields.combat.fields.what.fields.roll.toFormGroup(
        {},
        {
          name: "roll",
          value: effect.system.expirations.combat.what.roll,
        },
      ),
    );
    contentHtml.append(
      effect.system.schema.fields.expiration.fields.combat.fields.what.fields.threshold.toFormGroup(
        {},
        {
          name: "threshold",
          value: effect.system.expirations.combat.what.threshold,
        },
      ),
    );
    try {
      new api.DialogV2({
        window: { title: `${effect.name} Expiration` },
        content: contentHtml,
        buttons: [
          {
            action: "roll",
            label: "Roll",
            default: true,
            callback: async (event, button) => {
              const expirationRoll = new TeriockRoll(
                button.form.elements.namedItem("roll").value,
                effect.actor.getRollData(),
              );
              await expirationRoll.toMessage({
                speaker: ChatMessage.getSpeaker({ actor: effect.actor }),
                flavor: `${effect.name} Ending Roll`,
              });
              if (expirationRoll.total >= Number(button.form.elements.namedItem("threshold").value)) {
                expire = true;
              }
            },
          },
          {
            action: "remove",
            label: "Remove",
            callback: () => (expire = true),
          },
        ],
      });
    } catch {
      expire = false;
    }
  }
  if (expire) {
    await effect.system.expire();
  }
}
