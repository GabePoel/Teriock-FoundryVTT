import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

/**
 * Dialog to select what type of macro to make.
 * @param {ChildDocument} doc
 * @returns {Promise<"linked"|"general">} Type of macro to be made.
 */
export default async function hotbarDropDialog(doc) {
  const label = TERIOCK.config.document[doc.type].label.toLowerCase();
  const context = {
    actor: `@UUID[${doc.actor?.uuid}]`,
    child: `@UUID[${doc.uuid}]`,
    label,
    identifier: doc.lookupKey,
  };
  const content = await TeriockTextEditor.enrichHTML(
    await TeriockTextEditor.renderTemplate("teriock/dialogs/hotbar-drop", context),
  );
  const choice = await TeriockDialog.prompt({
    buttons: [
      {
        action: "linked",
        callback: () => "linked",
        icon: makeIconClass(TERIOCK.display.icons.ui.linked),
        label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.linked"),
      },
    ],
    content: content,
    modal: true,
    ok: {
      callback: () => "general",
      default: true,
      label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.general"),
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
      title: _loc("TERIOCK.DIALOGS.HotbarDrop.title"),
    },
  });
  return choice;
}
