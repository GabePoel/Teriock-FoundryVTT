import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog to create or import a new document.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<"import" | "create">}
 */
export default async function newDocumentDialog(type) {
  const name = TERIOCK.config.document[type].name;
  const typeName = name.toLowerCase();
  return await TeriockDialog.prompt({
    buttons: [
      {
        label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.create"),
        callback: () => "create",
        icon: makeIconClass(TERIOCK.display.icons.ui.custom, "button"),
      },
    ],
    content: _loc("TERIOCK.DIALOGS.NewDocument.content", { typeName }),
    modal: true,
    ok: {
      label: _loc("TERIOCK.DIALOGS.NewDocument.BUTTONS.import"),
      default: true,
      callback: () => "import",
      icon: makeIconClass(TERIOCK.display.icons.ui.import, "button"),
    },
    window: {
      title: _loc("TERIOCK.DIALOGS.NewDocument.title", { name }),
      icon: makeIconClass(TERIOCK.display.icons.ui.add, "title"),
    },
  });
}
