import { setStatDiceDialog } from "../../../applications/dialogs/_module.mjs";
import { dieOptions } from "../../../constants/die-options.mjs";
import { traits } from "../../../constants/generated/traits.mjs";
import { copyAbility } from "../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../helpers/utils.mjs";
import { StatDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {TeriockBaseItemData}
 * @mixes StatDataMixin
 * @mixes WikiDataMixin
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
    namespace: "Creature",
    pageNameKey: "name",
    type: "species",
    usable: false,
    wiki: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      adult: new fields.NumberField({
        initial: 20,
      }),
      appearance: new TextField({
        label: "Appearance",
      }),
      applyHp: new fields.BooleanField({
        hint: "Add this species' HP to its parent actor.",
        initial: true,
        label: "Apply HP",
      }),
      applyMp: new fields.BooleanField({
        hint: "Add this species' MP to its parent actor.",
        initial: true,
        label: "Apply MP",
      }),
      applySize: new fields.BooleanField({
        label: "Apply Size",
        hint: "Apply this species' size to its parent actor.",
        initial: true,
      }),
      br: new fields.NumberField({ initial: 1, label: "Battle Rating" }),
      description: new TextField({
        label: "Description",
      }),
      innateRanks: new TextField({
        label: "Innate ranks",
      }),
      lifespan: new fields.NumberField({
        initial: 100,
      }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      size: new fields.SchemaField({
        min: new fields.NumberField(),
        max: new fields.NumberField(),
        value: new fields.NumberField({
          initial: 3,
        }),
      }),
      sizeStepHp: new fields.NumberField({
        hint: "Size interval at which this species' HP increases.",
        initial: null,
        label: "HP Size Interval",
        nullable: true,
      }),
      sizeStepMp: new fields.NumberField({
        hint: "Size interval at which this species' MP increases.",
        initial: null,
        label: "MP Size Interval",
        nullable: true,
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
    });
    return schema;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
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

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    // Handle variable size stat dice
    await super._preUpdate(changes, options, user);
    for (const stat of Object.keys(dieOptions.stats)) {
      const sizeStepKey = `sizeStep${toTitleCase(stat)}`;
      const sizeStep =
        foundry.utils.getProperty(changes, `system.${sizeStepKey}`) ||
        this[sizeStepKey];
      if (sizeStep) {
        const size =
          foundry.utils.getProperty(changes, "system.size.value") ||
          this.size.value;
        const minSize =
          foundry.utils.getProperty(changes, "system.size.min") ||
          this.size.min;
        const numberBase =
          foundry.utils.getProperty(changes, `system.${stat}DiceBase.number`) ||
          this[`${stat}DiceBase`].number;
        const faces =
          foundry.utils.getProperty(changes, `system.${stat}DiceBase.faces`) ||
          this[`${stat}DiceBase`].faces;
        let number = numberBase;
        const sizeDelta = size - minSize;
        const numSteps = Math.floor(sizeDelta / sizeStep);
        if (numSteps && numSteps > 0) number += numSteps;
        this._setDice(stat, number, faces);
      }
    }
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
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
