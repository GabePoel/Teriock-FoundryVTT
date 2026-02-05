import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog to create or import a new document.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<"import" | "create">}
 */
export default async function newDocumentDialog(type) {
  return await TeriockDialog.prompt({
    content:
      `Would you like to import an existing ${TERIOCK.options.document[type].name.toLowerCase()} or create one from` +
      ` scratch?`,
    window: {
      title: `New ${TERIOCK.options.document[type].name}`,
      icon: makeIconClass(TERIOCK.display.icons.ui.add, "title"),
    },
    modal: true,
    ok: {
      label: "Import",
      default: true,
      callback: () => "import",
      icon: makeIconClass("download", "button"),
    },
    buttons: [
      {
        label: "Create",
        callback: () => "create",
        icon: makeIconClass("hammer-brush", "button"),
      },
    ],
  });
}
