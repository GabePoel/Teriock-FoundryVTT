import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { BooleanField } = foundry.data.fields;

/**
 * Dialog that refreshes from compendium.
 * @param {TeriockCommon} doc
 * @returns {Promise<void>}
 */
export default async function refreshFromCompendiumDialog(doc) {
  let source;
  const sourceEmbedElement = document.createElement("fieldset");
  if (doc._stats.compendiumSource) {
    source = await fromUuid(doc._stats.compendiumSource);
    if (source.type === "wrapper") {
      source = source.system.effect;
    }
    sourceEmbedElement.innerHTML = await TeriockTextEditor.enrichHTML(
      `@Embed[${source.uuid}]`,
    );
    const figureElement =
      /** @type {HTMLElement} */ sourceEmbedElement.querySelector(
        ".content-embed",
      );
    figureElement.style.margin = "0";
  } else {
    sourceEmbedElement.innerHTML = await TeriockTextEditor.enrichHTML(
      `<p>@UUID[${doc.uuid}] has no compendium source set.</p>`,
    );
  }
  const sourceLegendElement = document.createElement("legend");
  sourceLegendElement.innerText = "Source Document";
  sourceEmbedElement.insertAdjacentElement("afterbegin", sourceLegendElement);
  const contentElement = document.createElement("div");
  contentElement.append(sourceEmbedElement);
  const optionsElement = document.createElement("fieldset");
  const optionsLegendElement = document.createElement("legend");
  optionsLegendElement.innerText = "Refresh Options";
  optionsElement.append(optionsLegendElement);
  contentElement.append(optionsElement);
  let fields = {
    updateDocument: new BooleanField({
      label: "Update Document",
      initial: true,
      hint: "If checked, will update local document to match the compendium source.",
    }),
    deleteChildren: new BooleanField({
      label: "Delete Children",
      initial: true,
      hint: "If checked, will delete children that aren't present in the compendium source.",
    }),
    createChildren: new BooleanField({
      label: "Create Children",
      initial: !(doc.type === "rank" && doc.system.classRank >= 3),
      hint: "If checked, will create children that aren't present in the local document.",
    }),
    updateChildren: new BooleanField({
      label: "Update Children",
      initial: true,
      hint: "If checked, will update children to match the compendium source.",
    }),
    recursive: new BooleanField({
      label: "Refresh Recursively",
      initial: true,
      hint: "If checked, refreshes will apply recursively.",
    }),
  };
  for (const [key, field] of Object.entries(fields)) {
    optionsElement.append(
      field.toFormGroup({ rootId: foundry.utils.randomID() }, { name: key }),
    );
  }
  await TeriockDialog.prompt({
    content: contentElement,
    modal: false,
    ok: {
      callback: async (_event, button) => {
        const options = {};
        for (const key of Object.keys(fields)) {
          options[key] = button.form.elements.namedItem(key)["checked"];
        }
        await doc.system.refreshFromCompendiumSource(options);
      },
      icon: makeIconClass("check", "button"),
      label: "Refresh",
    },
    position: {
      width: 450,
    },
    window: {
      icon: makeIconClass("book-atlas", "title"),
      title: `Refresh ${doc.nameString} From Compendium`,
    },
  });
}
