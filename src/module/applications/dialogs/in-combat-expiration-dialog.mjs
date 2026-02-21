import { BaseRoll } from "../../dice/rolls/_module.mjs";
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
    const name = effect.system.nameString;
    expire = await TeriockDialog.confirm({
      window: {
        title: game.i18n.format("TERIOCK.DIALOGS.InCombatExpiration.title", {
          name,
        }),
        icon: makeIconClass("circle-question", "title"),
      },
      content: game.i18n.format(
        "TERIOCK.DIALOGS.InCombatExpiration.contentConfirm",
        { name },
      ),
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
      descriptionLegend.innerText = game.i18n.localize(
        "TERIOCK.DIALOGS.InCombatExpiration.endConditionLegend",
      );
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
          title: game.i18n.format("TERIOCK.DIALOGS.InCombatExpiration.title", {
            name: effect.name,
          }),
          icon: makeIconClass("dice-d4", "title"),
        },
        content: contentHtml,
        buttons: [
          {
            action: "roll",
            label: game.i18n.localize(
              "TERIOCK.DIALOGS.InCombatExpiration.BUTTONS.roll",
            ),
            default: true,
            callback: async (_event, button) => {
              const expirationRoll = new BaseRoll(
                button.form.elements.namedItem("roll").value,
                effect.actor.getRollData(),
                {
                  flavor: game.i18n.format(
                    "TERIOCK.DIALOGS.InCombatExpiration.rollFlavor",
                    { name: effect.name },
                  ),
                  styles: {
                    dice: {
                      classes: "condition",
                    },
                  },
                  threshold: Number(
                    button.form.elements.namedItem("threshold").value,
                  ),
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
            label: game.i18n.localize(
              "TERIOCK.DIALOGS.InCombatExpiration.BUTTONS.remove",
            ),
            callback: async () => {
              await effect.system.expire();
            },
          },
        ],
      }).render(true);
    } catch {}
  }
}
