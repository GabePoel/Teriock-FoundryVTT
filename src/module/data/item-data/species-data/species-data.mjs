import { setStatDiceDialog } from "../../../applications/dialogs/_module.mjs";
import { traits } from "../../../constants/generated/traits.mjs";
import { copyAbility } from "../../../helpers/fetch.mjs";
import { StatDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

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
        label: "Description",
      }),
      appearance: new TextField({
        label: "Appearance",
      }),
      size: new fields.SchemaField({
        min: new fields.NumberField(),
        max: new fields.NumberField(),
        value: new fields.NumberField({
          initial: 3,
        }),
      }),
      traits: new fields.SetField(
        new fields.StringField({
          choices: traits,
        }),
        {
          initial: ["humanoid"],
          label: "Traits",
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
   * Faces of HP dice.
   * @returns {Teriock.RollOptions.PolyhedralDieFaces}
   */
  get hpDiceFaces() {
    return Object.values(this.hpDice)[0].faces;
  }

  /**
   * HP dice formula.
   * @returns {string}
   */
  get hpDiceFormula() {
    return `${this.hpDiceNumber}d${this.hpDiceFaces}`;
  }

  /**
   * Number of HP dice.
   * @returns {number}
   */
  get hpDiceNumber() {
    return Object.keys(this.hpDice).length;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Faces of MP dice.
   * @returns {Teriock.RollOptions.PolyhedralDieFaces}
   */
  get mpDiceFaces() {
    return Object.values(this.mpDice)[0].faces;
  }

  /**
   * MP dice formula.
   * @returns {string}
   */
  get mpDiceFormula() {
    return `${this.mpDiceNumber}d${this.mpDiceFaces}`;
  }

  /**
   * Number of MP dice.
   * @returns {number}
   */
  get mpDiceNumber() {
    return Object.keys(this.mpDice).length;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    this.parent.updateSource({
      effects: [
        (await copyAbility("Normal Intelligence")).toObject(),
        (await copyAbility("Normal Movement")).toObject(),
        (await copyAbility("Normal Perception")).toObject(),
        (await copyAbility("Normal Sneak")).toObject(),
        (await copyAbility("Normal Strength")).toObject(),
      ],
    });
    return super._preCreate(data, options, user);
  }

  /**
   * Set an HP dice formula.
   * @returns {Promise<void>}
   */
  async setHpDice() {
    await setStatDiceDialog(
      this.parent,
      "hp",
      this.hpDiceNumber,
      this.hpDiceFaces,
    );
  }

  /**
   * Set an MP dice formula.
   * @returns {Promise<void>}
   */
  async setMpDice() {
    await setStatDiceDialog(
      this.parent,
      "mp",
      this.mpDiceNumber,
      this.mpDiceFaces,
    );
  }
}
