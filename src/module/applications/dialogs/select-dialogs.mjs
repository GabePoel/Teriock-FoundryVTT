import { getTypeLabel } from "../../utils/_module.mjs";
import DocumentSelector from "./document-selector.mjs";

/**
 * @import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
 */

/**
 * Dialog to select compendiums.
 * @param {boolean} [checked=true]
 * @returns {Promise<CompendiumCollection<TeriockDocument>[]>}
 */
export async function selectCompendiumsDialog(checked = true) {
  const packDocs = game.packs.contents.filter(p => !p.locked).map(p => {
    return { img: p.banner || "icons/svg/book.svg", name: _loc(p.title), uuid: p.collection };
  });
  packDocs.sort((a, b) => a.name.localeCompare(b.name));
  const selected = await DocumentSelector.selectMulti(packDocs, {
    checked: checked ? packDocs.map(p => p.uuid) : [],
    hint: _loc("TERIOCK.DIALOGS.Select.Compendiums.hint"),
    title: _loc("TERIOCK.DIALOGS.Select.Compendiums.title"),
    tooltip: false,
  });
  return (selected || []).map(c => game.packs.get(c.uuid));
}

/**
 * Select a document.
 * @param {string} type
 * @param {Teriock.Select.DocumentSelectionConfig} [config]
 * @param {object} [options]
 * @param {string} [options.label]
 * @param {(event: Event) => void} [options.onConfirm]
 * @returns {Promise<TeriockDocument|null>}
 */
export async function selectDocument(type, config = {}, options = {}) {
  const label = options.label ?? getTypeLabel(type) ?? type;
  const selected = await DocumentSelector.selectFromConfig({ globalTypes: [type], multi: false, ...config }, {
    hint: _loc("TERIOCK.DIALOGS.Select.Name.hint", { name: label.toLocaleLowerCase(game.i18n.lang) }),
    onConfirm: options.onConfirm,
    openable: true,
    resolve: true,
    title: _loc("TERIOCK.DIALOGS.Select.Name.title", { name: label }),
  });
  if (!selected?.length) { return null; }
  return selected[0];
}
