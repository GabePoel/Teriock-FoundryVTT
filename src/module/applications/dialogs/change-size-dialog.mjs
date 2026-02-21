import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

/**
 * Ask if an actor's size should be updated to that of their new species.
 * @param {TeriockActor} actor
 * @param {TeriockSpecies} species
 * @returns {Promise<void>}
 */
export default async function changeSizeDialog(actor, species) {
  if (Number(actor.system.size.number.raw) !== species.system.size.value) {
    let content =
      `<p>@UUID[${actor.uuid}] is size ${actor.system.size.number.raw} and @UUID[${species.uuid}] is size` +
      ` ${species.system.size.value} by default. Would you like to update the actor's size?</p>`;
    content = await TeriockTextEditor.enrichHTML(content);
    const dialog = new TeriockDialog({
      window: {
        title: game.i18n.localize("TERIOCK.DIALOGS.ChangeSize.title"),
        icon: makeIconClass("circle-question", "title"),
      },
      modal: true,
      buttons: [
        {
          action: "changeSize",
          callback: async () => {
            await actor.update({
              "system.size.number.raw": species.system.size.value,
            });
          },
          default: true,
          icon: makeIconClass("check", "button"),
          label: game.i18n.localize("TERIOCK.DIALOGS.ChangeSize.BUTTONS.yes"),
        },
        {
          action: "no",
          icon: makeIconClass("xmark", "button"),
          label: game.i18n.localize("TERIOCK.DIALOGS.ChangeSize.BUTTONS.no"),
        },
      ],
      content,
    });
    await dialog.render(true);
  }
}
