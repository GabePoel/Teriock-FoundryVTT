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
    const noSourceText = game.i18n.format(
      "TERIOCK.DIALOGS.RefreshFromCompendium.noSource",
      { document: `@UUID[${doc.uuid}]` },
    );
    sourceEmbedElement.innerHTML =
      await TeriockTextEditor.enrichHTML(noSourceText);
  }
  const sourceLegendElement = document.createElement("legend");
  sourceLegendElement.innerText = game.i18n.localize(
    "TERIOCK.DIALOGS.RefreshFromCompendium.sourceLegend",
  );
  sourceEmbedElement.insertAdjacentElement("afterbegin", sourceLegendElement);
  const contentElement = document.createElement("div");
  contentElement.append(sourceEmbedElement);
  const optionsElement = document.createElement("fieldset");
  const optionsLegendElement = document.createElement("legend");
  optionsLegendElement.innerText = game.i18n.localize(
    "TERIOCK.DIALOGS.RefreshFromCompendium.optionsLegend",
  );
  optionsElement.append(optionsLegendElement);
  contentElement.append(optionsElement);
  let fields = {
    updateDocument: new BooleanField({
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateDocument.label",
      ),
      initial: true,
      hint: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateDocument.hint",
      ),
    }),
    deleteChildren: new BooleanField({
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.deleteChildren.label",
      ),
      initial: true,
      hint: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.deleteChildren.hint",
      ),
    }),
    createChildren: new BooleanField({
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.createChildren.label",
      ),
      initial: !(doc.type === "rank" && doc.system.classRank >= 3),
      hint: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.createChildren.hint",
      ),
    }),
    updateChildren: new BooleanField({
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateChildren.label",
      ),
      initial: true,
      hint: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.updateChildren.hint",
      ),
    }),
    recursive: new BooleanField({
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.recursive.label",
      ),
      initial: true,
      hint: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.FIELDS.recursive.hint",
      ),
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
      label: game.i18n.localize(
        "TERIOCK.DIALOGS.RefreshFromCompendium.BUTTONS.refresh",
      ),
    },
    position: {
      width: 450,
    },
    window: {
      icon: makeIconClass("book-atlas", "title"),
      title: game.i18n.format("TERIOCK.DIALOGS.RefreshFromCompendium.title", {
        name: doc.nameString,
      }),
    },
  });
}
