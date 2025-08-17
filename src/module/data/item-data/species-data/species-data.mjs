import { traits } from "../../../helpers/constants/generated/traits.mjs";
import { smartEvaluateSync } from "../../../helpers/utils.mjs";
import { StatDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
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
export default class TeriockSpeciesData extends StatDataMixin(
  WikiDataMixin(TeriockBaseItemData),
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

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      description: new TextField({
        initial: "<p>None.</p>",
        label: "Description",
      }),
      appearance: new TextField({
        initial: "<p>None.</p>",
        label: "Appearance",
      }),
      size: new fields.SchemaField({
        min: new fields.NumberField(),
        max: new fields.NumberField(),
        value: new fields.NumberField({
          initial: 3,
        }),
      }),
      hp: new fields.SchemaField({
        raw: new FormulaField({
          initial: "5",
        }),
      }),
      mp: new fields.SchemaField({
        raw: new FormulaField({
          initial: "5",
        }),
      }),
      traits: new fields.SetField(
        new fields.StringField({
          choices: traits,
        }),
        {
          initial: ["humanoid"],
        },
      ),
      lifespan: new fields.NumberField({
        initial: 100,
      }),
      adult: new fields.NumberField({
        initial: 20,
      }),
      applySize: new fields.BooleanField({
        label: "Apply Size",
        hint: "Apply this species' size to its parent actor.",
        initial: true,
      }),
      applyHp: new fields.BooleanField({
        label: "Apply HP",
        hint: "Add this species' HP to its parent actor.",
        initial: true,
      }),
      applyMp: new fields.BooleanField({
        label: "Apply MP",
        hint: "Add this species' MP to its parent actor.",
        initial: true,
      }),
    });
    return schema;
  }

  /**
   * Set a defined number of HP and automatically adjust hit dice to fit.
   *
   * @param {number} value
   * @returns {Promise<void>}
   */
  async setHp(value) {
    const numDice = Math.ceil(value / 5);
    await this.setDice("hp", 5, numDice);
  }

  /**
   * Set a defined number of MP and automatically adjust mana dice to fit.
   *
   * @param {number} value
   * @returns {Promise<void>}
   */
  async setMp(value) {
    const numDice = Math.ceil(value / 5);
    await this.setDice("hp", 5, numDice);
  }

  /** @inheritDoc */
  prepareBaseData() {
    this.hp.value = smartEvaluateSync(this.hp.raw);
    this.mp.value = smartEvaluateSync(this.mp.raw);
  }
}
