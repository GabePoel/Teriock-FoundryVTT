import { createElement } from "../../../helpers/html.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";
import { TeriockDialog } from "../../api/_module.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that lets you select something.
 * @param {Record<string, string>} choices - Key/value pairs to select from.
 * @param {Teriock.Select.SelectDialogOptions} [options] - Dialog options.
 * @returns {Promise<string|null>} The chosen value, or `null` if canceled or genericOther.
 */
export default async function selectDialog(choices, options = {}) {
  const {
    genericOther = true,
    hint = _loc("TERIOCK.DIALOGS.Select.defaults.hint"),
    hintHtml = "",
    hintTitle = "",
    icon = makeIconClass(TERIOCK.display.icons.ui.select, "title"),
    initial = null,
    label = _loc("TERIOCK.DIALOGS.Select.defaults.label"),
    other = false,
    required = false,
    title = _loc("TERIOCK.DIALOGS.Select.defaults.title"),
  } = options;

  const selectContentHtml = document.createElement("div");
  const selectField = new fields.StringField({ choices, hint, initial, label, required });
  selectContentHtml.append(selectField.toFormGroup({ rootId: foundry.utils.randomID() }, { name: "selected" }));
  if (hintHtml.length > 0) {
    const appendHtmlElement = createElement("div", { innerHTML: await TeriockTextEditor.enrichHTML(hintHtml) });
    if (hintTitle.length > 0) {
      const fieldsetElement = document.createElement("fieldset");
      const fieldsetLegend = createElement("legend", { innerText: hintTitle });
      fieldsetElement.append(fieldsetLegend);
      fieldsetElement.append(appendHtmlElement);
      selectContentHtml.append(fieldsetElement);
    } else {
      selectContentHtml.append(appendHtmlElement);
    }
  }

  if (!other) {
    return TeriockDialog.prompt({
      content: selectContentHtml,
      modal: true,
      ok: { callback: (_event, button) => button.form.elements.namedItem("selected").value },
      window: { icon: makeIconClass(icon, "title"), title },
    });
  }

  const otherContentHtml = document.createElement("div");
  const otherField = new fields.StringField({ hint, label });
  otherContentHtml.append(
    otherField.toFormGroup({ rootId: foundry.utils.randomID(), units: "other" }, { name: "other" }),
  );

  return TeriockDialog.prompt({
    buttons: [{
      action: "other",
      label: _loc("TERIOCK.DIALOGS.Select.otherButton"),
      callback: async (_event, _button, dialog) => {
        dialog.classList.add("force-hidden");
        if (genericOther) { return null; }

        return TeriockDialog.prompt({
          content: otherContentHtml,
          modal: true,
          ok: { callback: (_event, button) => button.form.elements.namedItem("other").value },
          window: { icon: makeIconClass(TERIOCK.display.icons.ui.custom, "title"), title },
        });
      },
    }],
    content: selectContentHtml,
    modal: true,
    ok: { default: true, callback: (_event, button) => button.form.elements.namedItem("selected").value },
    window: { icon: makeIconClass(TERIOCK.display.icons.ui.select, "title"), title },
  });
}
