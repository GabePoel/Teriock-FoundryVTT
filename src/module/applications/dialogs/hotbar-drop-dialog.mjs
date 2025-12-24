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
    const context = {
      label: TERIOCK.options.document[doc.type].name.toLowerCase(),
      name: doc.name,
      child: await TextEditor.enrichHTML(`@UUID[${doc.uuid}]`),
      actor: await TextEditor.enrichHTML(`@UUID[${doc.actor.uuid}]`),
    };
    const content = await foundry.applications.handlebars.renderTemplate(
      systemPath("templates/dialog-templates/hotbar-drop.hbs"),
      context,
    );
    choice = await TeriockDialog.prompt({
      window: {
        icon: makeIconClass("circle-question", "title"),
        title: `Macro Type Selection`,
      },
      modal: true,
      content: content,
      ok: {
        default: true,
        label: "General",
        callback: () => "general",
      },
      buttons: [
        {
          action: "linked",
          label: "Linked",
          callback: () => "linked",
        },
      ],
    });
  }
  return choice;
}
