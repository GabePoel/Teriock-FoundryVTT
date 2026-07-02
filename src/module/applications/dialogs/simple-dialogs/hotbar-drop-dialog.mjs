import { makeIconClass } from "../../../helpers/icon.mjs";
import TeriockDialog from "../../api/dialog.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

/**
 * Dialog to select what type of macro to make.
 * @param {AnyChildDocument} doc
 * @returns {Promise<"linked"|"general">} Type of macro to be made.
 */
export default async function hotbarDropDialog(doc) {
  const label = TERIOCK.config.document[doc.type].label.toLowerCase();
  const context = { actor: `@UUID[${doc.actor?.uuid}]`, child: `@UUID[${doc.uuid}]`, identifier: doc.lookupKey, label };
  const content = await TeriockTextEditor.enrichHTML(
    await TeriockTextEditor.renderTemplate("teriock/dialogs/hotbar-drop", context),
  );
  return TeriockDialog.prompt({
    buttons: [{
      action: "linked",
      icon: makeIconClass(TERIOCK.display.icons.ui.linked),
      label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.linked"),
      callback: () => "linked",
    }],
    content,
    modal: true,
    ok: { default: true, label: _loc("TERIOCK.DIALOGS.HotbarDrop.BUTTONS.general"), callback: () => "general" },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
      title: _loc("TERIOCK.DIALOGS.HotbarDrop.title"),
    },
  });
}
