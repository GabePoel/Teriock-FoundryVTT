import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog that sets qualifiers.
 * @param {TeriockChild} doc
 */
export default async function setQualifiersDialog(doc) {
  const ephemeralForm =
    doc.system.schema.fields.qualifiers.fields.ephemeral.fields.saved.toFormGroup(
      {},
      { name: "ephemeral", value: doc.system.qualifiers.ephemeral.saved },
    );
  const suppressedForm =
    doc.system.schema.fields.qualifiers.fields.suppressed.fields.saved.toFormGroup(
      {},
      { name: "suppressed", value: doc.system.qualifiers.suppressed.saved },
    );
  const contentElement = document.createElement("div");
  contentElement.append(...[ephemeralForm, suppressedForm]);
  await TeriockDialog.prompt({
    content: contentElement,
    modal: true,
    ok: {
      callback: async (_event, button) => {
        const ephemeral = button.form.elements.namedItem("ephemeral").value;
        const suppressed = button.form.elements.namedItem("suppressed").value;
        await doc.update({
          "system.qualifiers.ephemeral.saved": ephemeral,
          "system.qualifiers.suppressed.saved": suppressed,
        });
      },
      icon: makeIconClass("check", "button"),
      label: "Confirm",
    },
    position: {
      width: 450,
    },
    window: {
      icon: makeIconClass("eye-low-vision", "title"),
      title: `Set ${doc.nameString} Qualifiers`,
    },
  });
}
