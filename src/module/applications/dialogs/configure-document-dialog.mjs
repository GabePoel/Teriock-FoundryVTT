import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog that sets qualifiers.
 * @param {TeriockCommon} doc
 * @returns {Promise<void>}
 */
export default async function configureDocumentDialog(doc) {
  const contentElement = document.createElement("div");
  if (doc.system.qualifiers) {
    const ephemeralForm =
      doc.system.schema.fields.qualifiers.fields.ephemeral.fields.raw.toFormGroup(
        { rootId: foundry.utils.randomID() },
        {
          name: "ephemeral",
          value: doc.system._source.qualifiers.ephemeral.raw,
        },
      );
    const suppressedForm =
      doc.system.schema.fields.qualifiers.fields.suppressed.fields.raw.toFormGroup(
        { rootId: foundry.utils.randomID() },
        {
          name: "suppressed",
          value: doc.system._source.qualifiers.suppressed.raw,
        },
      );
    contentElement.append(...[ephemeralForm, suppressedForm]);
  }
  const compendiumSourceForm =
    doc.schema.fields._stats.fields.compendiumSource.toFormGroup(
      {
        rootId: foundry.utils.randomID(),
        label: "Compendium Source",
        hint:
          "An unembedded document in a compendium that this is sourced from. If this is refreshed, it pulls data" +
          " from the document defined here.",
      },
      {
        name: "compendiumSource",
        value: doc._stats.compendiumSource,
      },
    );
  contentElement.append(compendiumSourceForm);
  await TeriockDialog.prompt({
    content: contentElement,
    modal: false,
    ok: {
      callback: async (_event, button) => {
        const ephemeral = button.form.elements.namedItem("ephemeral")?.value;
        const suppressed = button.form.elements.namedItem("suppressed")?.value;
        const compendiumSource =
          button.form.elements.namedItem("compendiumSource").value;
        const updateData = {
          "_stats.compendiumSource": compendiumSource,
        };
        if (ephemeral) {
          updateData["system.qualifiers.ephemeral.raw"] = ephemeral;
        }
        if (suppressed) {
          updateData["system.qualifiers.suppressed.raw"] = suppressed;
        }
        await doc.update(updateData);
      },
      icon: makeIconClass("check", "button"),
      label: "Confirm",
    },
    position: {
      width: 450,
    },
    window: {
      icon: makeIconClass("eye-low-vision", "title"),
      title: `Configure ${doc.nameString}`,
    },
  });
}
