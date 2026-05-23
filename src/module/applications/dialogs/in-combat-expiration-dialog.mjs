import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { createElement } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog that asks the {@link TeriockUser} if their effect should expire.
 * @param {TeriockLingering} effect - The consequence to make the dialog for.
 * @param {boolean} [forceDialog] - Force a dialog to show up.
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationDialog(effect, forceDialog = false) {
  if (effect.system.expirations.combat.what.type === "none" && !forceDialog) return;
  let expire = false;
  if (effect.system.expirations.combat.what.type === "forced" && !forceDialog) {
    const name = effect.system.fullName;
    expire = await TeriockDialog.confirm({
      content: _loc("TERIOCK.DIALOGS.InCombatExpiration.contentConfirm", { name }),
      modal: true,
      position: { width: 550 },
      rejectClose: false,
      window: {
        icon: makeIconClass(TERIOCK.config.document[effect.type].icon, "title"),
        title: _loc("TERIOCK.DIALOGS.InCombatExpiration.title", { name }),
      },
    });
    if (expire) await effect.system.expire();
  } else if (effect.system.expirations.combat.what.type === "rolled" || forceDialog) {
    const contentHtml = document.createElement("div");
    const rootId = foundry.utils.randomID();
    if (effect.system.expirations.description) {
      const descriptionElement = document.createElement("fieldset");
      descriptionElement.append(
        createElement("legend", { innerText: _loc("TERIOCK.DIALOGS.InCombatExpiration.endConditionLegend") }),
      );
      descriptionElement.append(
        createElement("div", { innerText: await TextEditor.enrichHTML(effect.system.expirations.description) }),
      );
      contentHtml.append(descriptionElement);
    }
    contentHtml.append(
      effect.getFieldForProperty("system.expirations.combat.what.roll").toFormGroup({ rootId }, {
        name: "roll",
        value: effect.system.expirations.combat.what.roll,
      }),
      effect.getFieldForProperty("system.expirations.combat.what.threshold").toFormGroup({ rootId }, {
        name: "threshold",
        value: effect.system.expirations.combat.what.threshold,
      }),
    );
    await new TeriockDialog({
      buttons: [{
        action: "roll",
        default: true,
        icon: makeIconClass(TERIOCK.display.icons.ui.dice, "button"),
        label: _loc("TERIOCK.DIALOGS.InCombatExpiration.BUTTONS.roll"),
        callback: async (_event, button) => {
          const expirationRoll = new BaseRoll(
            button.form.elements.namedItem("roll").value,
            effect.actor.getRollData(),
            {
              flavor: _loc("TERIOCK.DIALOGS.InCombatExpiration.rollFlavor", { name: effect.name }),
              styles: { dice: { classes: "condition" } },
              threshold: Number(button.form.elements.namedItem("threshold").value),
            },
          );
          await expirationRoll.toMessage({ speaker: TeriockChatMessage.getSpeaker({ actor: effect.actor }) }, {
            messageMode: game.settings.get("core", "messageMode"),
          });
          if (expirationRoll.total >= Number(button.form.elements.namedItem("threshold").value))
            await effect.system.expire();
        },
      }, {
        action: "remove",
        icon: makeIconClass(TERIOCK.display.icons.ui.remove, "button"),
        label: _loc("TERIOCK.DIALOGS.InCombatExpiration.BUTTONS.remove"),
        callback: async () => await effect.system.expire(),
      }],
      content: contentHtml,
      position: { width: 550 },
      window: {
        icon: makeIconClass(TERIOCK.config.document[effect.type].icon, "title"),
        title: _loc("TERIOCK.DIALOGS.InCombatExpiration.title", { name: effect.name }),
      },
    }).render(true);
  }
}
