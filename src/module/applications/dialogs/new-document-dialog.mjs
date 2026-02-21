import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog to create or import a new document.
 * @param {Teriock.Documents.ChildType} type
 * @returns {Promise<"import" | "create">}
 */
export default async function newDocumentDialog(type) {
  const name = TERIOCK.options.document[type].name;
  const typeName = name.toLowerCase();
  return await TeriockDialog.prompt({
    content: game.i18n.format("TERIOCK.DIALOGS.NewDocument.content", {
      typeName,
    }),
    window: {
      title: game.i18n.format("TERIOCK.DIALOGS.NewDocument.title", { name }),
      icon: makeIconClass(TERIOCK.display.icons.ui.add, "title"),
    },
    modal: true,
    ok: {
      label: game.i18n.localize("TERIOCK.DIALOGS.NewDocument.BUTTONS.import"),
      default: true,
      callback: () => "import",
      icon: makeIconClass("download", "button"),
    },
    buttons: [
      {
        label: game.i18n.localize("TERIOCK.DIALOGS.NewDocument.BUTTONS.create"),
        callback: () => "create",
        icon: makeIconClass("hammer-brush", "button"),
      },
    ],
  });
}
