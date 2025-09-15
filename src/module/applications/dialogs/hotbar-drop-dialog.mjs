import { systemPath } from "../../helpers/path.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Dialog to select what type of macro to make.
 * @param {TeriockItem|TeriockEffect} doc
 * @returns {Promise<string>} Type of macro to be made.
 */
export default async function hotbarDropDialog(doc) {
  let macroType = "linked";
  if (doc.type === "ability") {
    const context = {
      ability: await TextEditor.enrichHTML(`@UUID[${doc.uuid}]`),
      actor: await TextEditor.enrichHTML(`@UUID[${doc.actor.uuid}]`),
    };
    const content = await foundry.applications.handlebars.renderTemplate(systemPath(
      "templates/dialog-templates/hotbar-drop.hbs"), context);
    macroType = "general";
    macroType = await TeriockDialog.prompt({
      window: {
        icon: "fa-solid fa-circle-question",
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
  return macroType;
}
