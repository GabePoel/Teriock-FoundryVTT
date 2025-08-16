import { smartEvaluateSync } from "../../../helpers/utils.mjs";
import { WikiDataMixin } from "../../mixins/_module.mjs";
import { FormulaField, TextField } from "../../shared/fields.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";

const { fields } = foundry.data;

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {TeriockBaseItemData}
 */
export default class TeriockSpeciesData extends WikiDataMixin(
  TeriockBaseItemData,
) {
  /**
   * Metadata for this item.
   *
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    namespace: "Species",
    pageNameKey: "name",
    type: "species",
    usable: false,
    wiki: true,
  });

  /**
   * Index of this in parent order.
   * @returns {number|null}
   */
  get order() {
    return this.actor?.system.orderings.species.findIndex(
      (id) => id === this.parent.id,
    );
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      description: new TextField({
        initial: "",
        label: "Description",
      }),
      appearance: new TextField({
        initial: "",
        label: "Appearance",
      }),
      size: new fields.SchemaField({
        min: new fields.NumberField(),
        max: new fields.NumberField(),
        value: new fields.NumberField(),
      }),
      hp: new fields.SchemaField({
        raw: new FormulaField(),
      }),
      mp: new fields.SchemaField({
        raw: new FormulaField(),
      }),
    });
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.hp.value = smartEvaluateSync(this.hp.raw);
    this.mp.value = smartEvaluateSync(this.mp.raw);
  }
}
