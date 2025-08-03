const { DialogV2 } = foundry.applications.api;
const { TextEditor } = foundry.applications.ux;

/**
 * Dialog to select what type of macro to make.
 *
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
    const content = await foundry.applications.handlebars.renderTemplate(
      "systems/teriock/src/templates/dialog-templates/hotbar-drop.hbs",
      context,
    );
    macroType = "general";
    macroType = await DialogV2.prompt({
      window: { title: `Macro Type Selection` },
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
