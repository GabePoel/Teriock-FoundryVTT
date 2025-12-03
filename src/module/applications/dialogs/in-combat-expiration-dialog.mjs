import { TeriockRoll } from "../../dice/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog that asks the {@link TeriockUser} if their effect should expire.
 * @param {TeriockLingering} effect - The consequence to make the dialog for.
 * @param {boolean} [forceDialog] - Force a dialog to show up.
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationDialog(
  effect,
  forceDialog = false,
) {
  if (effect.system.expirations.combat.what.type === "none" && !forceDialog) {
    return;
  }
  let expire = false;
  if (effect.system.expirations.combat.what.type === "forced" && !forceDialog) {
    expire = await TeriockDialog.confirm({
      window: {
        title: `${effect.system.nameString} Expiration`,
        icon: makeIconClass("circle-question", "title"),
      },
      content: `Should ${effect.system.nameString} expire?`,
      modal: true,
      rejectClose: false,
    });
    if (expire) {
      await effect.system.expire();
    }
  } else if (
    effect.system.expirations.combat.what.type === "rolled" ||
    forceDialog
  ) {
    const contentHtml = document.createElement("div");
    if (effect.system.expirations.description) {
      const descriptionElement = document.createElement("fieldset");
      const descriptionLegend = document.createElement("legend");
      descriptionLegend.innerText = "End Condition";
      descriptionElement.append(descriptionLegend);
      const descriptionText = await TextEditor.enrichHTML(
        effect.system.expirations.description,
      );
      const descriptionDiv = document.createElement("div");
      descriptionDiv.innerHTML = descriptionText;
      descriptionElement.append(descriptionDiv);
      contentHtml.append(descriptionElement);
    }
    contentHtml.append(
      effect.system.schema.fields.expirations.fields.combat.fields.what.fields.roll.toFormGroup(
        { rootId: foundry.utils.randomID() },
        {
          name: "roll",
          value: effect.system.expirations.combat.what.roll,
        },
      ),
    );
    contentHtml.append(
      effect.system.schema.fields.expirations.fields.combat.fields.what.fields.threshold.toFormGroup(
        { rootId: foundry.utils.randomID() },
        {
          name: "threshold",
          value: effect.system.expirations.combat.what.threshold,
        },
      ),
    );
    try {
      await new TeriockDialog({
        window: {
          title: `${effect.name} Expiration`,
          icon: makeIconClass("dice-d4", "title"),
        },
        content: contentHtml,
        buttons: [
          {
            action: "roll",
            label: "Roll",
            default: true,
            callback: async (_event, button) => {
              const expirationRoll = new TeriockRoll(
                button.form.elements.namedItem("roll").value,
                effect.actor.getRollData(),
                {
                  flavor: `${effect.name} Ending Roll`,
                  context: {
                    diceClass: "condition",
                    threshold: Number(
                      button.form.elements.namedItem("threshold").value,
                    ),
                  },
                },
              );
              await expirationRoll.toMessage(
                {
                  speaker: TeriockChatMessage.getSpeaker({
                    actor: effect.actor,
                  }),
                },
                {
                  rollMode: game.settings.get("core", "rollMode"),
                },
              );
              if (
                expirationRoll.total >=
                Number(button.form.elements.namedItem("threshold").value)
              ) {
                await effect.system.expire();
              }
            },
          },
          {
            action: "remove",
            label: "Remove",
            callback: async () => {
              await effect.system.expire();
            },
          },
        ],
      }).render(true);
    } catch {}
  }
}
