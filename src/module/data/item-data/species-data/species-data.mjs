import { setStatDiceDialog } from "../../../applications/dialogs/_module.mjs";
import { copyAbility } from "../../../helpers/fetch.mjs";
import { toTitleCase } from "../../../helpers/string.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import { StatDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _parse } from "./methods/_parsing.mjs";

const { fields } = foundry.data;

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {TeriockBaseItemModel}
 * @mixes StatDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockSpeciesModel extends StatDataMixin(WikiDataMixin(TeriockBaseItemModel)) {
  /**
   * @inheritDoc
   * @type {Teriock.Documents.ItemModelMetadata}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Creature",
    type: "species",
  });

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      adult: new fields.NumberField({ initial: 20 }),
      appearance: new TextField({ label: "Appearance" }),
      applySize: new fields.BooleanField({
        hint: "Apply this species' size to its parent actor.",
        initial: true,
        label: "Apply Size",
      }),
      attributeIncrease: new TextField({ label: "Attribute increase" }),
      br: new fields.NumberField({
        initial: 1,
        label: "Battle Rating",
      }),
      description: new TextField({ label: "Description" }),
      hpIncrease: new TextField({ label: "Hit increase" }),
      innateRanks: new TextField({ label: "Innate ranks" }),
      lifespan: new fields.NumberField({ initial: 100 }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      size: new fields.SchemaField({
        max: new fields.NumberField(),
        min: new fields.NumberField(),
        value: new fields.NumberField({
          initial: 3,
        }),
      }),
      sizeStepAbilities: new fields.TypedObjectField(new fields.SchemaField({
        gain: new fields.SetField(new fields.StringField()),
        lose: new fields.SetField(new fields.StringField()),
      })),
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
      traits: new fields.SetField(new fields.StringField({ choices: TERIOCK.index.traits }), {
        initial: [ "humanoid" ],
        label: "Traits",
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if (this.parent.name === "New Species") {
      this.parent.updateSource({
        effects: [
          (await copyAbility("Normal Intelligence")).toObject(),
          (await copyAbility("Normal Movement")).toObject(),
          (await copyAbility("Normal Perception")).toObject(),
          (await copyAbility("Normal Sneak")).toObject(),
          (await copyAbility("Normal Strength")).toObject(),
        ],
      });
    }
    return super._preCreate(data, options, user);
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) {
      return false;
    }
    const size = foundry.utils.getProperty(changes, "system.size.value") || this.size.value;

    // Handle variable size abilities
    if (Object.keys(this.sizeStepAbilities).length > 0) {
      const gainAbilities = new Set();
      const loseAbilities = new Set();
      const minSizeStep = Math.min(...Object.keys(this.sizeStepAbilities).map((k) => Number(k)));
      this.sizeStepAbilities[minSizeStep].lose.forEach((a) => gainAbilities.add(a));
      for (const sizeStep of Object.keys(this.sizeStepAbilities)) {
        if (size >= sizeStep) {
          this.sizeStepAbilities[sizeStep].lose.forEach((a) => {
            gainAbilities.delete(a);
            loseAbilities.add(a);
          });
          this.sizeStepAbilities[sizeStep].gain.forEach((a) => {
            gainAbilities.add(a);
          });
        } else {
          this.sizeStepAbilities[sizeStep].gain.forEach((a) => {
            loseAbilities.add(a);
          });
        }
      }

      const toDelete = [];
      for (const abilityName of loseAbilities) {
        const ids = this.parent.abilities
          .filter((a) => a.name === abilityName && !a.sup)
          .map((a) => a.id);
        toDelete.push(...ids);
      }
      await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
      const newAbilities = [];
      for (const abilityName of gainAbilities) {
        if (!this.parent.abilities.find((a) => a.name === abilityName && !a.sup)) {
          const ability = await copyAbility(abilityName);
          const abilityObject = ability.toObject();
          newAbilities.push(abilityObject);
        }
      }
      await this.parent.createEmbeddedDocuments("ActiveEffect", newAbilities);
    }

    // Handle variable size stat dice
    for (const stat of Object.keys(TERIOCK.options.die.stats)) {
      const sizeStepKey = `sizeStep${toTitleCase(stat)}`;
      const sizeStep = foundry.utils.getProperty(changes, `system.${sizeStepKey}`) || this[sizeStepKey];
      if (sizeStep) {
        const minSize = foundry.utils.getProperty(changes, "system.size.min") || this.size.min;
        const numberBase = foundry.utils.getProperty(changes, `system.${stat}DiceBase.number`)
          || this[`${stat}DiceBase`].number;
        const faces = foundry.utils.getProperty(changes, `system.${stat}DiceBase.faces`)
          || this[`${stat}DiceBase`].faces;
        let number = numberBase;
        const sizeDelta = size - minSize;
        const numSteps = Math.floor(sizeDelta / sizeStep);
        if (numSteps && numSteps > 0) {
          number += numSteps;
        }
        this._setDice(changes, stat, number, faces);
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
    await setStatDiceDialog(this.parent, "hp", this.hpDiceNumber, this.hpDiceFaces);
  }

  /**
   * Set an MP dice formula.
   * @returns {Promise<void>}
   */
  async setMpDice() {
    await setStatDiceDialog(this.parent, "mp", this.mpDiceNumber, this.mpDiceFaces);
  }
}
