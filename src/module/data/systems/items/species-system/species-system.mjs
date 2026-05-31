import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockActor } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { makeIcon, makeIconClass } from "../../../../helpers/utils.mjs";
import { speciesTransformationFields } from "../../../fields/helpers/transformation-fields.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.SpeciesSystemData}
 * @mixes CompetenceDisplaySystem
 * @mixes SpeciesPanelPart
 * @mixes StatGiverSystem
 * @mixes WikiSystem
 */
export default class SpeciesSystem
  extends mixClasses(
    BaseItemSystem,
    systemMixins.WikiSystemMixin,
    systemMixins.StatGiverSystemMixin,
    systemMixins.CompetenceDisplaySystemMixin,
    parts.SpeciesPanelPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Species"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childItemTypes: ["body", "equipment", "rank"],
      type: "species",
      visibleTypes: ["ability", "body", "equipment", "fluency", "rank", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      adult: new fields.NumberField({ initial: 0, min: 0 }),
      appearance: new fields.HTMLField(),
      attributeIncrease: new fields.HTMLField(),
      br: new fields.NumberField({ initial: 1 }),
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
      description: new fields.HTMLField(),
      hpIncrease: new fields.HTMLField(),
      innateRanks: new fields.HTMLField(),
      lifespan: new fields.NumberField({ initial: 0, min: 0 }),
      mpIncrease: new fields.HTMLField(),
      size: new fields.SchemaField({
        enabled: new fields.BooleanField({ initial: true }),
        max: new fields.NumberField(),
        min: new fields.NumberField(),
        value: new fields.NumberField({ initial: 3 }),
      }),
      traits: new fields.SetField(new fields.StringField({ choices: TERIOCK.reference.traits }), {
        initial: ["humanoid"],
      }),
      transformation: new fields.SchemaField(speciesTransformationFields()),
    });
  }

  /** @inheritDoc */
  get _canToggleHpDice() {
    return super._canToggleHpDice && !this._isInactiveTransformation;
  }

  /** @inheritDoc */
  get _canToggleMpDice() {
    return super._canToggleMpDice && !this._isInactiveTransformation;
  }

  /** @inheritDoc */
  get _displayButtons() {
    const buttons = super._displayButtons;
    if (!this.size.min || !this.size.max) {
      buttons.push({
        button: "sizeRange",
        label: "TERIOCK.SYSTEMS.Species.FIELDS.size.range.label",
        update: { "system.size.max": this.size.value, "system.size.min": this.size.value },
      });
    }
    if (!this.adult) {
      buttons.push({
        button: "lifespan",
        label: "TERIOCK.SYSTEMS.Species.PANELS.lifespan.label",
        update: { "system.adult": 20, "system.lifespan": 100 },
      });
    }
    return buttons;
  }

  /** @inheritDoc */
  get _displayFields() {
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
  get _displayInputs() {
    return [...super._displayInputs, "system.traits", "system.transformation.img"];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._traitTags];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return ["system.size.enabled", "system.transformation.ring", ...super._displayToggles];
  }

  /**
   * Whether this is part of an inactive transformation.
   * @returns {boolean}
   */
  get _isInactiveTransformation() {
    return this.isTransformation && this.transformationEffect && !this.transformationEffect.active;
  }

  /**
   * Trait tags.
   * @returns {Teriock.Display.DisplayTag[]}
   */
  get _traitTags() {
    const tags = Array.from(this.traits).map(t => {
      return { label: TERIOCK.reference.traits[t], tooltip: "TERIOCK.SYSTEMS.Species.FIELDS.traits.label" };
    });
    if (this.transformationEffect?.system.transformation.level) {
      tags.push({
        label: TERIOCK.config.transformation.level[this.transformationEffect.system.transformation.level],
        tooltip: "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
      });
    }
    return tags;
  }

  /** @inheritDoc */
  get color() {
    if (this.isTransformation) {
      if (this.transformationEffect.system.transformation.level === "minor") {
        return TERIOCK.display.colors.palette.blue;
      }
      if (this.transformationEffect.system.transformation.level === "full") {
        return TERIOCK.display.colors.palette.green;
      }
      if (this.transformationEffect.system.transformation.level === "greater") {
        return TERIOCK.display.colors.palette.purple;
      }
    }
    return super.color;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([...simplifyTags(this._traitTags), parts.text]);
    parts.subtitle = _loc("TYPES.Item.species");
    return parts;
  }

  /**
   * Whether this is a primary transformation species.
   * @returns {boolean}
   */
  get isPrimaryTransformation() {
    if (this.isTransformation) {
      const transformationEffect = this.transformationEffect;
      if (transformationEffect && transformationEffect.system.isPrimaryTransformation) { return true; }
    }
    return false;
  }

  /**
   * Whether this is part of a transformation.
   * @returns {boolean}
   */
  get isTransformation() {
    return Boolean(this.transformationEffect) && this.transformationEffect.system.isTransformation;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (this.isTransformation && this.parent.actor) {
      const transformationEffect = this.transformationEffect;
      suppressed ||= (transformationEffect && !transformationEffect.active) || !this.isPrimaryTransformation;
    }
    return suppressed;
  }

  /**
   * Transformation that provides this.
   * @returns {TeriockLingering|null}
   */
  get transformationEffect() {
    if (!this.actor) { return null; }
    return this.parent.dependee ?? null;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Creature:${TERIOCK.index.creatures[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async deleteThis() {
    if (this.transformationEffect) {
      const proceed = await TeriockDialog.confirm({
        content: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.content"),
        modal: true,
        rejectClose: false,
        window: {
          icon: makeIconClass(TERIOCK.display.icons.effect.transform, "title"),
          title: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.title"),
        },
      });
      if (proceed) { await this.transformationEffect.delete(); }
      else { await super.deleteThis(); }
    } else {
      await super.deleteThis();
    }
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [...super.getCardContextMenuEntries(doc), {
      group: "control",
      icon: makeIcon(TERIOCK.display.icons.effect.transform, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation"),
      onClick: this.setPrimaryTransformation.bind(this),
      visible: this.isTransformation && !this.isPrimaryTransformation,
    }];
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = super.getLocalRollData();
    Object.assign(data, {
      adult: this.adult,
      br: this.br,
      lifespan: this.lifespan,
      size: this.size.enabled ? this.size.value : 0,
      "size.enabled": Number(this.size.enabled),
      "size.max": this.size.enabled ? this.size.max : 0,
      "size.min": this.size.enabled ? this.size.min : 0,
      transformation: Number(this.isTransformation),
      ["transformation.level"]: this.transformationEffect?.system.transformation.level || 0,
      "transformation.primary": Number(this.isPrimaryTransformation),
    });
    for (const trait of this.traits) { data[`trait.${toCamelCase(trait)}`] = 1; }
    return data;
  }

  /** @inheritDoc */
  getRollData() {
    const rollData = super.getRollData();
    if (!this.actor) { rollData.size = this.size.enabled ? this.size.value : 0; }
    return rollData;
  }

  /** @inheritDoc */
  prepareBaseData() {
    if (this.size.enabled && !this.size.value) { this.size.value = 3; }
    super.prepareBaseData();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this._isInactiveTransformation) {
      this.statDice.hp.disabled = true;
      this.statDice.mp.disabled = true;
    }
  }

  /**
   * Set the effects controlling this transformation as the primary transformation.
   * @returns {Promise<void>}
   */
  async setPrimaryTransformation() {
    await this.transformationEffect?.system.setPrimaryTransformation();
  }

  /**
   * Data that represents this species as a creature.
   * @param {object} [data] Optional data to mutate the created creature.
   * @returns {Promise<ActorData>}
   */
  async toCreature(data = {}) {
    return foundry.utils.mergeObject({
      _id: this.parent.id,
      img: this.parent.img,
      items: await this.parent.toObjects(),
      name: this.parent.name,
      prototypeToken: {
        height: TeriockActor.sizeConfig(this.size.value).length,
        name: this.parent.name,
        ring: {
          enabled: this.transformation.ring,
          subject: { texture: this.transformation.ring ? this.transformation.img : undefined },
        },
        texture: { src: this.parent.img },
        width: TeriockActor.sizeConfig(this.size.value).length,
      },
      system: {
        _src: this.parent.uuid,
        hp: { value: TERIOCK.config.system.inf },
        mp: { value: TERIOCK.config.system.inf },
        size: { number: this.size.value },
      },
      type: "creature",
    }, data);
  }
}
