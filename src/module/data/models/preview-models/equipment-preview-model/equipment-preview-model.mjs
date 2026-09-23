import { pathSorterFactory } from "../../../../helpers/sort.mjs";
import { toKebabCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { TernaryField } from "../../../fields/_module.mjs";
import { nullStringField } from "../../../fields/tools/builders.mjs";
import BasePreviewModel from "../base-preview-model/base-preview-model.mjs";

/**
 * @inheritDoc
 * @see {EquipmentSystem}
 */
export default class EquipmentPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static get sorters() {
    return Object.assign(super.sorters, {
      av: { label: "TERIOCK.SYSTEMS.Armament.FIELDS.av.raw.label", sorter: pathSorterFactory("system.av.value") },
      bv: { label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label", sorter: pathSorterFactory("system.bv.value") },
      damage: {
        label: "TERIOCK.SYSTEMS.Armament.FIELDS.damage.label",
        sorter: pathSorterFactory("system.damage.base"),
      },
      equipmentType: {
        label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentType.label",
        sorter: pathSorterFactory("system.equipmentType"),
      },
      minStr: { label: "TERIOCK.SYSTEMS.Equipment.FIELDS.minStr.label", sorter: pathSorterFactory("system.minStr") },
      tier: {
        label: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
        sorter: pathSorterFactory("system.tier.value"),
      },
      weight: {
        label: "TERIOCK.SYSTEMS.Equipment.FIELDS.weight.label",
        sorter: pathSorterFactory("system.totalWeight"),
      },
    });
  }

  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      attuned: new TernaryField({ label: "TERIOCK.SYSTEMS.Attunement.USAGE.attuned" }),
      consumable: new TernaryField({ label: "TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label" }),
      equipmentClasses: nullStringField({
        choices: TERIOCK.config.equipment.equipmentClasses,
        label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label",
      }),
      equipped: new TernaryField({ label: "TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label" }),
      identified: new TernaryField({ label: "TERIOCK.MODELS.Identification.FIELDS.identified.label" }),
      kind: nullStringField({
        choices: objectMap(TERIOCK.config.equipment.kind, e => e.label),
        label: "TERIOCK.SYSTEMS.Child.FIELDS.kind.label",
      }),
      properties: nullStringField({
        label: "TERIOCK.PACKS.properties",
        choices: () => game.teriock.identifiers.getNames("property", { permission: "LIMITED" }),
      }),
      style: nullStringField({
        label: "TERIOCK.SYSTEMS.Armament.FIELDS.style.label",
        choices: () => game.teriock.identifiers.getNames("style", { permission: "LIMITED" }),
      }),
    });
  }

  /**
   * Whether some equipment has a property that matches some key.
   * @param {TeriockItem<"equipment">} equipment
   * @param {string} propertyKey
   * @returns {boolean}
   */
  #hasProperty(equipment, propertyKey) {
    return equipment.previewed.identifiers.has(`property:${toKebabCase(propertyKey)}`);
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [
      ...super._formPathsSelect,
      "filters.equipmentClasses",
      "filters.properties",
      "filters.style",
      "filters.kind",
    ];
  }

  /** @inheritDoc */
  get _formPathsTernary() {
    return [
      ...super._formPathsTernary,
      "filters.equipped",
      "filters.attuned",
      "filters.identified",
      "filters.consumable",
    ];
  }

  /**
   * @inheritDoc
   * @param {TeriockItem<"equipment">[]} documents
   * @returns {Generator<TeriockItem<"equipment">, void, void>}
   */
  *filterDocuments(documents) {
    const f = this.filters;
    for (const document of super.filterDocuments(documents)) {
      const system = document.system;
      if (
        (!f.properties || this.#hasProperty(document, f.properties))
        && this._checkTernaryFilter(f.equipped, system?.equipped)
        && this._checkTernaryFilter(f.attuned, system?.isAttuned)
        && this._checkTernaryFilter(f.identified, system?.identification?.identified)
        && this._checkTernaryFilter(f.consumable, system?.consumable)
        && (!f.kind || system?.kind === f.kind)
        && (!f.equipmentClasses || (system?.equipmentClasses || new Set()).has(f.equipmentClasses))
        && (!f.style || system?._source?.style === f.style)
      ) { yield document; }
    }
  }
}
