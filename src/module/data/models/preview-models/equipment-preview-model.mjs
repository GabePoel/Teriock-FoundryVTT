import { toCamelCase } from "../../../helpers/string.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { TernaryField } from "../../fields/_module.mjs";
import { nullString } from "../../fields/helpers/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * @typedef {BaseFilters} EquipmentFilters
 * @property {Teriock.Keys.EquipmentClass|null} equipmentClasses
 * @property {string|null} properties
 * @property {string|null} weaponFightingStyles
 * @property {Teriock.Keys.PowerLevel|null} powerLevel
 * @property {boolean|null} attuned
 * @property {boolean|null} consumable
 * @property {boolean|null} equipped
 * @property {boolean|null} identified
 */

/**
 * @property {EquipmentFilters} filters
 */
export default class EquipmentPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static get defaultSortOption() {
    return "name";
  }

  /** @inheritDoc */
  static get sortOrders() {
    return TERIOCK.config.display.equipmentSortOrders;
  }

  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      attuned: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Attunement.USAGE.attuned") }),
      consumable: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label") }),
      equipmentClasses: nullString({
        choices: TERIOCK.reference.equipmentClasses,
        label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipmentClasses.label"),
      }),
      equipped: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.equipped.label") }),
      identified: new TernaryField({ label: _loc("TERIOCK.MODELS.Identification.FIELDS.identified.label") }),
      powerLevel: nullString({
        choices: objectMap(TERIOCK.config.equipment.powerLevel, e => e.label),
        label: _loc("TERIOCK.SYSTEMS.Equipment.FIELDS.powerLevel.label"),
      }),
      properties: nullString({ choices: TERIOCK.reference.properties, label: _loc("TERIOCK.PACKS.properties") }),
      weaponFightingStyles: nullString({
        choices: TERIOCK.reference.weaponFightingStyles,
        label: _loc("TERIOCK.SYSTEMS.Armament.FIELDS.fightingStyle.label"),
      }),
    });
  }

  /**
   * Whether some equipment has a property that matches some key.
   * @param {TeriockEquipment} equipment
   * @param {string} propertyKey
   * @returns {boolean}
   */
  #hasProperty(equipment, propertyKey) {
    return (equipment.properties ?? []).map(p => toCamelCase(p.forcedIdentifier)).includes(propertyKey);
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [
      ...super._formPathsSelect,
      "filters.equipmentClasses",
      "filters.properties",
      "filters.weaponFightingStyles",
      "filters.powerLevel",
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

  /** @inheritDoc */
  get _sortMap() {
    return {
      av: e => e.system.av?.value ?? 0,
      bv: e => e.system.bv?.value ?? 0,
      consumable: e => Number(e.system.consumable),
      damage: e => e.system.damage?.base ?? "",
      dampened: e => Number(e.system.dampened),
      equipmentType: e => e.system.equipmentType ?? "",
      equipped: e => Number(e.system.equipped),
      identified: e => Number(e.system.identification?.identified ?? 0),
      minStr: e => e.system.minStr ?? 0,
      name: e => e.name,
      powerLevel: e => e.system.powerLevel ?? 0,
      shattered: e => Number(e.system.shattered),
      tier: e => e.system.tier?.value ?? 0,
      weight: e => e.system.totalWeight ?? e.system.weight ?? 0,
    };
  }

  /**
   * @inheritDoc
   * @param {TeriockEquipment[]} documents
   * @returns {Generator<TeriockEquipment, void, void>}
   */
  *filterDocuments(documents) {
    const f = this.filters;
    for (const document of documents) {
      // Body parts and mounts share only some of these fields, so access them defensively.
      const system = document.system;
      if (
        (!f.properties || this.#hasProperty(document, f.properties))
        && this._checkTernaryFilter(f.equipped, system?.equipped)
        && this._checkTernaryFilter(f.attuned, system?.isAttuned)
        && this._checkTernaryFilter(f.identified, system?.identification?.identified)
        && this._checkTernaryFilter(f.consumable, system?.consumable)
        && (!f.powerLevel || system?.powerLevel === f.powerLevel)
        && (!f.equipmentClasses || (system?.equipmentClasses || new Set()).has(f.equipmentClasses))
        && (!f.weaponFightingStyles || system?.fightingStyle === f.weaponFightingStyles)
      ) { yield document; }
    }
  }
}
