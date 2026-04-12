import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { BooleanField } = foundry.data.fields;

/**
 * Dialog that refreshes from compendium.
 * @param {CommonDocument} doc
 * @returns {Promise<void>}
 */
export default async function refreshFromCompendiumDialog(doc) {
  let source;
  const sourceEmbedElement = document.createElement("fieldset");
  if (doc._stats.compendiumSource) {
    source = await fromUuid(doc._stats.compendiumSource);
    sourceEmbedElement.innerHTML = await TeriockTextEditor.enrichHTML(
      `@Embed[${source.uuid}]`,
    );
    const figureElement =
      /** @type {HTMLElement} */ sourceEmbedElement.querySelector(
        ".content-embed",
      );
    figureElement.style.margin = "0";
  } else {
    const noSourceText = _loc(
      "TERIOCK.DIALOGS.RefreshFromCompendium.noSource",
      { document: `@UUID[${doc.uuid}]` },
    );
    sourceEmbedElement.innerHTML =
      await TeriockTextEditor.enrichHTML(noSourceText);
  }
  const sourceLegendElement = document.createElement("legend");
  sourceLegendElement.innerText = _loc(
    "TERIOCK.DIALOGS.RefreshFromCompendium.sourceLegend",
  );
  sourceEmbedElement.insertAdjacentElement("afterbegin", sourceLegendElement);
  const contentElement = document.createElement("div");
  contentElement.append(sourceEmbedElement);
  const optionsElement = document.createElement("fieldset");
  const optionsLegendElement = document.createElement("legend");
  optionsLegendElement.innerText = _loc(
    "TERIOCK.DIALOGS.RefreshFromCompendium.optionsLegend",
  );
  optionsElement.append(optionsLegendElement);
  contentElement.append(optionsElement);
  let fields = {
    updateDocument: new BooleanField({
      label: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateDocument.label",
      ),
      initial: true,
      hint: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateDocument.hint",
      ),
    }),
    deleteChildren: new BooleanField({
      label: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.deleteChildren.label",
      ),
      initial: true,
      hint: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.deleteChildren.hint",
      ),
    }),
    createChildren: new BooleanField({
      label: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.createChildren.label",
      ),
      initial: !(doc.type === "rank" && doc.system.classRank >= 3),
      hint: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.createChildren.hint",
      ),
    }),
    updateChildren: new BooleanField({
      label: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateChildren.label",
      ),
      initial: true,
      hint: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateChildren.hint",
      ),
    }),
    recursive: new BooleanField({
      label: _loc(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.recursive.label",
      ),
      initial: true,
      hint: _loc("TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.recursive.hint"),
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
      icon: makeIconClass(TERIOCK.display.icons.ui.select, "button"),
      label: _loc("TERIOCK.DIALOGS.RefreshFromCompendium.BUTTONS.refresh"),
    },
    position: {
      width: 450,
    },
    window: {
      icon: makeIconClass("fa-book-atlas", "title"),
      title: _loc("TERIOCK.DIALOGS.RefreshFromCompendium.title", {
        name: doc.fullName,
      }),
    },
  });
}
