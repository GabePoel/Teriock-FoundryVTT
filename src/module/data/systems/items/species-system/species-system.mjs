import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockActor } from "../../../../documents/_module.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { makeIcon, mix } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {BaseItemSystem}
 * @implements {Teriock.Models.SpeciesSystemInterface}
 * @mixes CompetenceDisplaySystem
 * @mixes SpeciesPanelPart
 * @mixes StatGiverSystem
 * @mixes WikiSystem
 */
export default class SpeciesSystem extends mix(
  BaseItemSystem,
  mixins.WikiSystemMixin,
  mixins.StatGiverSystemMixin,
  mixins.CompetenceDisplaySystemMixin,
  parts.SpeciesPanelPart,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childItemTypes: ["body", "equipment", "rank"],
      indexCategoryKey: "creatures",
      indexCompendiumKey: "species",
      namespace: "Creature",
      type: "species",
      visibleTypes: [
        "ability",
        "body",
        "equipment",
        "fluency",
        "rank",
        "resource",
      ],
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
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 1 },
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

  /** @inheritDoc */
  get displayFields() {
    return [
      "system.hpIncrease",
      "system.mpIncrease",
      "system.attributeIncrease",
      "system.innateRanks",
      "system.appearance",
      "system.description",
    ];
  }

  /** @inheritDoc */
  get displayToggles() {
    return ["system.size.enabled", "system.disabled"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([
      ...Array.from(this.traits),
      this.size.enabled ? `Size ${this.size.value}` : "",
    ]);
    parts.subtitle = "Species";
    return parts;
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
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
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
  async deleteThis() {
    if (this.transformationEffect) {
      const proceed = await TeriockDialog.confirm({
        window: {
          title: "Delete Effect?",
          icon: `fas fa-${TERIOCK.options.document.consequence.icon}`,
        },
        content:
          "This species is provided by a transformation effects. Would you like to delete that as well?",
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
  getCardContextMenuEntries(doc) {
    return [
      ...super.getCardContextMenuEntries(doc),
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

  getLocalRollData() {
    const data = super.getLocalRollData();
    Object.assign(data, {
      [`transformation.level`]: this.transformationLevel,
      transformation: Number(this.isTransformation),
      "transformation.primary": Number(this.isPrimaryTransformation),
      size: this.size.enabled ? this.size.value : 0,
      "size.max": this.size.enabled ? this.size.max : 0,
      "size.min": this.size.enabled ? this.size.min : 0,
      "size.enabled": Number(this.size.enabled),
      adult: this.adult,
      lifespan: this.lifespan,
      br: this.br,
    });
    for (const trait of this.traits) {
      data[`trait.${toCamelCase(trait)}`] = 1;
    }
    return data;
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    if (!this.parent.actor) {
      rollData.size = this.size.enabled ? this.size.value : 0;
    }
    return rollData;
  }

  /** @inheritDoc */
  prepareSpecialData() {
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

  /**
   * Set the effects controlling this transformation as the primary transformation.
   * @returns {Promise<void>}
   */
  async setPrimaryTransformation() {
    const transformationEffect = this.transformationEffect;
    if (transformationEffect) {
      await transformationEffect.system.setPrimaryTransformation();
    }
  }

  /**
   * Data that represents this species as a creature.
   * @param {object} [data] Optional data to mutate the created creature.
   * @returns {object}
   */
  toCreature(data = {}) {
    const hasTokenImg =
      !!TERIOCK.index.creatures[toCamelCase(this.parent.name)];
    const tokenImg = hasTokenImg
      ? this.parent.img.replace("icons/creatures", "icons/tokens")
      : this.parent.img;
    data = foundry.utils.mergeObject(
      {
        name: this.parent.name,
        type: "creature",
        img: this.parent.img,
        prototypeToken: {
          name: this.parent.name,
          ring: {
            enabled: hasTokenImg,
          },
          texture: {
            src: tokenImg,
          },
          width: TeriockActor.sizeDefinition(this.size.value).length / 5,
          height: TeriockActor.sizeDefinition(this.size.value).length / 5,
        },
        items: [game.items.fromCompendium(this.parent)],
        system: {
          hp: {
            value: 999999,
          },
          mp: {
            value: 999999,
          },
          size: {
            number: {
              saved: this.size.value,
            },
          },
        },
      },
      data,
    );
    data.items = [game.items.fromCompendium(this.parent)];
    return data;
  }
}
