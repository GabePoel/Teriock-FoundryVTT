import { makeIconClass } from "../../../helpers/icon.mjs";
import { TeriockDialog } from "../../api/_module.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

/**
 * Ask if an actor's size should be updated to that of their new species.
 * @param {TeriockActor} actor
 * @param {TeriockSpecies} species
 * @returns {Promise<void>}
 */
export default async function changeSizeDialog(actor, species) {
  if (actor.system.size.number !== species.system.size.value) {
    const proceed = await TeriockDialog.confirm({
      content: await TeriockTextEditor.enrichHTML(
        _loc("TERIOCK.DIALOGS.ChangeSize.content", {
          actor: `@UUID[${actor.uuid}]`,
          actorSize: actor.system.size.number,
          species: `@UUID[${species.uuid}]`,
          speciesSize: species.system.size.value,
        }),
      ),
      modal: true,
      position: { width: 400 },
      window: {
        icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
        title: _loc("TERIOCK.DIALOGS.ChangeSize.title"),
      },
    });
    if (proceed) { await actor.update({ "system.size.number": species.system.size.value }); }
  }
}
