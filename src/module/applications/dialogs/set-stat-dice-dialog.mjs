import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog that sets {@link StatDieModel} values.
 * @param {StatPoolModel} pool
 */
export default async function setStatDiceDialog(pool) {
  const numberForm = pool.schema.fields.number.fields.saved.toFormGroup(
    { rootId: foundry.utils.randomID() },
    {
      name: "number",
      value: pool.number.saved,
    },
  );
  const facesForm = pool.schema.fields.faces.toFormGroup(
    { rootId: foundry.utils.randomID() },
    {
      name: "faces",
      value: pool.faces,
    },
  );
  const disabledForm = pool.schema.fields.disabled.toFormGroup(
    { rootId: foundry.utils.randomID() },
    {
      name: "disabled",
      value: pool.disabled,
    },
  );
  const contentElement = document.createElement("div");
  contentElement.append(...[numberForm, facesForm, disabledForm]);
  await TeriockDialog.prompt({
    content: contentElement,
    modal: true,
    ok: {
      callback: async (_event, button) => {
        const numberInput =
          /** @type {HTMLInputElement} */ button.form.elements.namedItem(
            "number",
          );
        const facesInput =
          /** @type {HTMLInputElement} */ button.form.elements.namedItem(
            "faces",
          );
        const disabledInput =
          /** @type {HTMLInputElement} */ button.form.elements.namedItem(
            "disabled",
          );
        const number = numberInput.value;
        const faces = Number(facesInput.value);
        const disabled = disabledInput.checked;
        if (
          number !== pool.number.saved ||
          faces !== pool.faces ||
          disabled === pool.disabled
        ) {
          await pool.update({
            "number.saved": number,
            faces: faces,
            disabled: disabled,
          });
        }
      },
      icon: makeIconClass("check", "button"),
      label: "Confirm",
    },
    window: {
      icon: makeIconClass("dice", "title"),
      title: `Set ${pool.dieName}`,
    },
  });
}
