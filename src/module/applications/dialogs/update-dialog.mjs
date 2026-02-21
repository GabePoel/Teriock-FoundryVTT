import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Create a dialog to update the specified paths.
 * @param {GenericCommon} doc
 * @param {string[]} paths
 * @param {string} [title]
 * @param {string} [icon]
 */
export default async function updateDialog(
  doc,
  paths,
  title,
  icon = "file-pen",
) {
  const resolvedTitle =
    title ?? game.i18n.localize("TERIOCK.DIALOGS.Update.defaults.title");
  const content = document.createElement("div");
  content.classList.add("teriock-form-container");
  for (const path of paths) {
    const schema = doc.getSchema(path);
    const value = foundry.utils.getProperty(doc, `_source.${path}`);
    const formGroup = schema.toFormGroup(
      { rootId: foundry.utils.randomID() },
      {
        name: path,
        value,
      },
    );
    content.append(formGroup);
  }
  const dialog = new TeriockDialog({
    buttons: [
      {
        action: "update",
        label: game.i18n.localize("TERIOCK.DIALOGS.Update.BUTTONS.update"),
        default: true,
        icon: makeIconClass("check", "button"),
        callback: async function (_event, button) {
          const namedElements = /** @type {HTMLInputElement[]} */ Array.from(
            button.form.elements,
          ).filter((el) => el.hasAttribute("name"));
          const updateData = Object.fromEntries(
            namedElements.map((el) => [
              el.getAttribute("name"),
              el.type === "checkbox" ? el.checked : el.value,
            ]),
          );
          await doc.update(updateData);
        },
      },
    ],
    content: content.outerHTML,
    position: {
      width: 500,
    },
    window: {
      title: resolvedTitle,
      icon: makeIconClass(icon, "title"),
    },
  });
  await dialog.render(true);
}
