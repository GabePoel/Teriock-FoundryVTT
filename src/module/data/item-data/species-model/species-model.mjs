import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { copyAbility, getItem } from "../../../helpers/fetch.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import {
  HierarchyDataMixin,
  ImporterDataMixin,
  StatGiverDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
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
 * @mixes StatGiverDataMixin
 * @mixes WikiDataMixin
 * @mixes ImporterDataMixin
 */
export default class TeriockSpeciesModel extends ImporterDataMixin(
  StatGiverDataMixin(WikiDataMixin(HierarchyDataMixin(TeriockBaseItemModel))),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      namespace: "Creature",
      type: "species",
      indexCategoryKey: "creatures",
      indexCompendiumKey: "species",
      childItemTypes: ["body", "equipment", "rank"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      adult: new fields.NumberField({ initial: 20 }),
      appearance: new TextField({ label: "Appearance" }),
      attributeIncrease: new TextField({ label: "Attribute increase" }),
      br: new fields.NumberField({
        initial: 1,
        label: "Battle Rating",
      }),
      description: new TextField({ label: "Description" }),
      hpIncrease: new TextField({ label: "Hit increase" }),
      innateRanks: new TextField({ label: "Innate ranks" }),
      lifespan: new fields.NumberField({ initial: 100 }),
      mpIncrease: new TextField({ label: "Mana increase" }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      size: new fields.SchemaField({
        enabled: new fields.BooleanField({
          hint: "Whether or not this species has a size associated with it.",
          initial: true,
          label: "Size",
        }),
        max: new fields.NumberField(),
        min: new fields.NumberField(),
        value: new fields.NumberField({
          initial: 3,
        }),
      }),
      sizeStepAbilities: new fields.TypedObjectField(
        new fields.SchemaField({
          gain: new fields.SetField(new fields.StringField()),
          lose: new fields.SetField(new fields.StringField()),
        }),
      ),
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
        new fields.StringField({ choices: TERIOCK.index.traits }),
        {
          initial: ["humanoid"],
          label: "Traits",
        },
      ),
      transformationLevel: new fields.StringField({
        choices: TERIOCK.options.effect.transformationLevel,
        initial: null,
        nullable: true,
        required: false,
      }),
    });
    return schema;
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Set Primary Transformation",
        icon: makeIcon("tree", "contextMenu"),
        callback: this.setPrimaryTransformation.bind(this),
        condition:
          this.isTransformation &&
          !this.isPrimaryTransformation &&
          Boolean(this.transformationEffect),
        group: "control",
      },
    ];
  }

  /** @inheritDoc */
  get color() {
    if (this.transformationLevel === "minor") {
      return TERIOCK.display.colors.blue;
    } else if (this.transformationLevel === "full") {
      return TERIOCK.display.colors.green;
    } else if (this.transformationLevel === "greater") {
      return TERIOCK.display.colors.purple;
    } else {
      return super.color;
    }
  }

  /**
   * Whether this is a primary transformation species.
   * @returns {boolean}
   */
  get isPrimaryTransformation() {
    if (this.isTransformation && this.transformationEffect) {
      return this.transformationEffect.system.isPrimaryTransformation;
    } else {
      return false;
    }
  }

  /**
   * Whether this is part of a transformation.
   * @returns {boolean}
   */
  get isTransformation() {
    return Boolean(this.transformationLevel);
  }

  /** @inheritDoc */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    if (this.isTransformation && this.parent.actor) {
      suppressed =
        suppressed ||
        !this.isPrimaryTransformation ||
        (this.transformationEffect && !this.transformationEffect.active);
    }
    if (
      this.parent.actor &&
      this.parent.actor.system.isTransformed &&
      !this.isTransformation
    ) {
      return true;
    }
    return suppressed;
  }

  /**
   * Transformation that provides this.
   * @returns {TeriockLingering|null}
   */
  get transformationEffect() {
    const transformations = this.parent.actor.transformations;
    for (const transformation of transformations) {
      if (
        transformation.system.transformation.species.includes(this.parent.id)
      ) {
        return transformation;
      }
    }
    return null;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
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
    const size =
      foundry.utils.getProperty(changes, "system.size.value") ||
      this.size.value;

    // Handle variable size abilities
    if (Object.keys(this.sizeStepAbilities).length > 0) {
      const gainAbilities = new Set();
      const loseAbilities = new Set();
      const minSizeStep = Math.min(
        ...Object.keys(this.sizeStepAbilities).map((k) => Number(k)),
      );
      this.sizeStepAbilities[minSizeStep].lose.forEach((a) =>
        gainAbilities.add(a),
      );
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
      if (toDelete.length > 0) {
        await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
      }
      const newAbilities = [];
      for (const abilityName of gainAbilities) {
        if (
          !this.parent.abilities.find((a) => a.name === abilityName && !a.sup)
        ) {
          const ability = await copyAbility(abilityName);
          const abilityObject = ability.toObject();
          newAbilities.push(abilityObject);
        }
      }
      if (newAbilities.length > 0) {
        await this.parent.createEmbeddedDocuments("ActiveEffect", newAbilities);
      }
    }
  }

  /** @inheritDoc */
  async deleteThis() {
    if (this.transformationEffect) {
      const proceed = await TeriockDialog.confirm({
        window: {
          title: "Delete Effect?",
          icon: `fas fa-${TERIOCK.options.document.consequence.icon}`,
        },
        content:
          "This species is provided by a transformation effect. Would you like to delete that as well?",
        modal: true,
        rejectClose: false,
      });
      if (proceed) {
        await this.transformationEffect.delete();
      } else {
        await super.deleteThis();
      }
    } else {
      await super.deleteThis();
    }
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    if (typeof rollData.size === "undefined") {
      rollData.size = this.size?.value || 0;
    }
    return rollData;
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  prepareSpecialData() {
    if (
      this.transformationLevel === "minor" ||
      this.transformationLevel === "full"
    ) {
      this.statDice.mp.disabled = true;
    }
    if (this.parent.actor) {
      if (this.parent.actor.system.isTransformed) {
        if (!this.isTransformation) {
          this.statDice.hp.disabled = true;
          if (this.parent.actor.system.transformation.level === "greater") {
            this.statDice.mp.disabled = true;
          }
        } else {
          if (!this.isPrimaryTransformation) {
            this.statDice.hp.disabled = true;
            this.statDice.mp.disabled = true;
          }
        }
      } else if (this.isTransformation) {
        this.statDice.hp.disabled = true;
        this.statDice.mp.disabled = true;
      }
    }
    super.prepareSpecialData();
  }

  /** @inheritDoc */
  async refreshFromIndex() {
    const updateData = {};
    for (const key of Object.keys(this.sizeStepAbilities)) {
      updateData[`system.sizeStepAbilities.-=${key}`] = null;
    }
    await this.parent.update(updateData);
    const referenceSpecies = await getItem(this.parent.name, "species");
    if (referenceSpecies) {
      const toUpdate = [];
      for (const ability of this.parent.getAbilities()) {
        const referenceAbility = referenceSpecies
          .getAbilities()
          .find((a) => a.name === ability.name);
        if (referenceAbility) {
          const referenceData = referenceAbility.toObject();
          foundry.utils.deleteProperty(referenceData, "_id");
          foundry.utils.deleteProperty(referenceData, "effects");
          foundry.utils.deleteProperty(referenceData, "system.hierarchy");
          toUpdate.push({
            _id: ability.id,
            ...referenceData,
          });
        }
      }
      await this.parent.updateEmbeddedDocuments("ActiveEffect", toUpdate);
    }
    await super.refreshFromIndex();
  }

  /**
   * Set the effect controlling this transformation as the primary transformation.
   * @returns {Promise<void>}
   */
  async setPrimaryTransformation() {
    const transformationEffect = this.transformationEffect;
    if (transformationEffect) {
      await transformationEffect.system.setPrimaryTransformation();
    }
  }
}
