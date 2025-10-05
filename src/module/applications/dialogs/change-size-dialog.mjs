import { TeriockDialog } from "../api/_module.mjs";

const TextEditor = foundry.applications.ux.TextEditor.implementation;

/**
 * Ask if an actor's size should be updated to that of their new species.
 * @param {TeriockActor} actor
 * @param {TeriockSpecies} species
 * @returns {Promise<void>}
 */
export default async function changeSizeDialog(actor, species) {
  if (actor.system.size.number.saved !== species.system.size.value) {
    let content =
      `<p>@UUID[${actor.uuid}] is size ${actor.system.size.number.saved} and @UUID[${species.uuid}] is size` +
      ` ${species.system.size.value} by default. Would you like to update the actor's size?</p>`;
    content = await TextEditor.enrichHTML(content);
    const dialog = new TeriockDialog({
      window: {
        title: "Change Size",
        icon: "fa-solid fa-circle-question",
      },
      modal: true,
      buttons: [
        {
          action: "yes",
          label: "Yes",
          default: true,
          callback: async () => {
            await actor.update({
              "system.size.number.saved": species.system.size.value,
            });
          },
        },
        {
          action: "no",
          label: "No",
        },
      ],
      content,
    });
    await dialog.render(true);
  }
}
