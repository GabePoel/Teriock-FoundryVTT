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
  if (actor.system.size.number !== species.system.size.value) {
    let content = `<p>@UUID[${actor.uuid}] is size ${actor.system.size.number} and @UUID[${species.uuid}] is size`
      + ` ${species.system.size.value} by default. Would you like to update the actor's size?</p>`;
    content = await TeriockTextEditor.enrichHTML(content);
    const dialog = new TeriockDialog({
      buttons: [{
        action: "changeSize",
        default: true,
        icon: makeIconClass(TERIOCK.display.icons.ui.enable, "button"),
        label: _loc("TERIOCK.DIALOGS.ChangeSize.BUTTONS.yes"),
        callback: async () => {
          await actor.update({ "system.size.number": species.system.size.value });
        },
      }, {
        action: "no",
        icon: makeIconClass(TERIOCK.display.icons.ui.remove, "button"),
        label: _loc("TERIOCK.DIALOGS.ChangeSize.BUTTONS.no"),
      }],
      content,
      modal: true,
      window: {
        icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
        title: _loc("TERIOCK.DIALOGS.ChangeSize.title"),
      },
    });
    await dialog.render(true);
  }
}
