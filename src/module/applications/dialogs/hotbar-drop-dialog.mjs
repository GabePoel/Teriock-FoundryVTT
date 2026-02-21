import { systemPath } from "../../helpers/path.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog to select what type of macro to make.
 * @param {TeriockChild} doc
 * @returns {Promise<"linked"|"general">} Type of macro to be made.
 */
export default async function hotbarDropDialog(doc) {
  let choice = "general";
  if (doc.actor) {
    const label = TERIOCK.options.document[doc.type].name.toLowerCase();
    const context = {
      label,
      name: doc.name,
      child: `@UUID[${doc.uuid}]`,
      actor: `@UUID[${doc.actor.uuid}]`,
    };
    const content = await TextEditor.enrichHTML(
      await foundry.applications.handlebars.renderTemplate(
        systemPath("templates/dialog-templates/hotbar-drop.hbs"),
        context,
      ),
    );
    choice = await TeriockDialog.prompt({
      window: {
        icon: makeIconClass("circle-question", "title"),
        title: game.i18n.localize("TERIOCK.DIALOGS.HotbarDrop.title"),
      },
      modal: true,
      content: content,
      ok: {
        default: true,
        label: game.i18n.localize("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.general"),
        callback: () => "general",
      },
      buttons: [
        {
          action: "linked",
          label: game.i18n.localize(
            "TERIOCK.DIALOGS.HotbarDrop.BUTTONS.linked",
          ),
          callback: () => "linked",
        },
      ],
    });
  }
  return choice;
}
