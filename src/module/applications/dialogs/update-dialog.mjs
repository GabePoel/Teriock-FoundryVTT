import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Create a dialog to update the specified paths.
 * @param {AnyCommonDocument} doc
 * @param {string[]} paths
 * @param {string} [title]
 * @param {string} [icon]
 */
export default async function updateDialog(doc, paths, title, icon = "file-pen") {
  const resolvedTitle = title ?? _loc("TERIOCK.DIALOGS.Update.defaults.title");
  const content = document.createElement("div");
  content.classList.add("teriock-form-container");
  for (const path of paths) {
    const schema = doc.getSchema(path);
    const value = foundry.utils.getProperty(doc, `_source.${path}`);
    const formGroup = schema.toFormGroup({ rootId: foundry.utils.randomID() }, { name: path, value });
    content.append(formGroup);
  }
  const dialog = new TeriockDialog({
    buttons: [
      {
        action: "update",
        default: true,
        icon: makeIconClass(TERIOCK.display.icons.ui.enable, "button"),
        label: _loc("TERIOCK.DIALOGS.Update.BUTTONS.update"),
        callback: async function (_event, button) {
          const namedElements = /** @type {HTMLInputElement[]} */ Array.from(button.form.elements).filter(el =>
            el.hasAttribute("name"),
          );
          const updateData = Object.fromEntries(
            namedElements.map(el => [el.getAttribute("name"), el.type === "checkbox" ? el.checked : el.value]),
          );
          await doc.update(updateData);
        },
      },
    ],
    content: content.outerHTML,
    position: { width: 500 },
    window: { icon: makeIconClass(icon, "title"), title: resolvedTitle },
  });
  await dialog.render(true);
}
