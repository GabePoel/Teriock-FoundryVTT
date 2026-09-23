import ChoiceSelector from "./choice-selector.mjs";
import DocumentSelector from "./document-selector.mjs";

/**
 * @import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
 */

/**
 * Dialog to select an equipment class.
 * @returns {Promise<Teriock.Keys.EquipmentClass>}
 */
export async function selectEquipmentClassDialog() {
  return ChoiceSelector.prompt(TERIOCK.reference.equipmentClasses, {
    hint: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.hint"),
    label: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.label"),
    title: _loc("TERIOCK.DIALOGS.Select.EquipmentClass.title"),
  });
}

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
    checked: packDocs.map(p => p.uuid && checked),
    hint: _loc("TERIOCK.DIALOGS.Select.Compendiums.hint"),
    title: _loc("TERIOCK.DIALOGS.Select.Compendiums.title"),
    tooltip: false,
  });
  return selected.map(c => game.packs.get(c.uuid));
}

/**
 * Select a document.
 * @param {string} type
 * @param {Teriock.Select.DocumentSelectionConfig} [config]
 * @param {object} [options]
 * @param {string} [options.label]
 * @returns {Promise<TeriockDocument|null>}
 */
export async function selectDocument(type, config = {}, options = {}) {
  const selected = await DocumentSelector.selectFromConfig({ globalTypes: [type], multi: false, ...config }, {
    hint: _loc("TERIOCK.DIALOGS.Select.Name.hint", {
      name: (options.label ?? TERIOCK.config.document[type]?.label)?.toLocaleLowerCase(game.i18n.lang),
    }),
    openable: true,
    resolve: true,
    title: _loc("TERIOCK.DIALOGS.Select.Name.title", { name: (options.label ?? TERIOCK.config.document[type])?.label }),
  });
  if (!selected?.length) { return null; }
  return selected[0];
}
