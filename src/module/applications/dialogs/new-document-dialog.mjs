import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog to create or import a new document.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<"import" | "create">}
 */
export default async function newDocumentDialog(type) {
  const label = TERIOCK.config.document[type].label;
  const typeName = label.toLowerCase();
  return await TeriockDialog.prompt({
    buttons: [{
      icon: makeIconClass(TERIOCK.display.icons.ui.custom, "button"),
      label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.create"),
      callback: () => "create",
    }],
    content: _loc("TERIOCK.DIALOGS.NewDocument.content", { typeName }),
    modal: true,
    ok: {
      default: true,
      icon: makeIconClass(TERIOCK.display.icons.ui.import, "button"),
      label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.import"),
      callback: () => "import",
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.add, "title"),
      title: _loc("TERIOCK.DIALOGS.NewDocument.title", { name: label }),
    },
  });
}
