import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import statConfig from "../../../../constants/config/stat-config.mjs";
import systemConfig from "../../../../constants/config/system-config.mjs";
import { TeriockActor } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIconClass } from "../../../../helpers/icon.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import * as parts from "./parts/_module.mjs";

const { fields } = foundry.data;

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

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
 * @mixes SpeciesTransformationPart
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
    parts.SpeciesTransformationPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Species"];

  /** @inheritDoc */
  static get _automationTypes() {
    return [...super._automationTypes, automations.ToggleChildrenAutomation];
  }

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
      innateRanks: new fields.HTMLField(),
      lifespan: new fields.NumberField({ initial: 0, min: 0 }),
      ...Object.fromEntries(POOL_STATS.map(k => [`${k}Increase`, new fields.HTMLField()])),
      size: new fields.SchemaField({
        enabled: new fields.BooleanField({ initial: true }),
        max: new fields.NumberField(),
        min: new fields.NumberField(),
        value: new fields.NumberField({ initial: TERIOCK.config.system.baseValues.size }),
      }),
      traits: new fields.SetField(new fields.StringField({ choices: TERIOCK.reference.traits })),
    });
  }

  /**
   * Offer to resize the actor to match the size this species specifies.
   * @returns {Promise<void>}
   */
  async #onCreateChangeSize() {
    const actor = this.actor;
    if (!this.size.enabled || this.size.value === actor.system._source.size.value) { return; }
    const proceed = await TeriockDialog.confirm({
      content: await TeriockTextEditor.enrichHTML(
        _loc("TERIOCK.DIALOGS.ChangeSize.content", {
          actor: `@UUID[${actor.uuid}]`,
          actorSize: actor.system._source.size.value,
          species: `@UUID[${this.parent.uuid}]`,
          speciesSize: this.size.value,
        }),
      ),
      modal: true,
      position: { width: 400 },
      window: {
        icon: makeIconClass(TERIOCK.display.icons.ui.confirm, "title"),
        title: _loc("TERIOCK.DIALOGS.ChangeSize.title"),
      },
    });
    if (proceed) { await actor.update({ "system.size.value": this.size.value }); }
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
      this._displayFieldInstructions,
      ...POOL_STATS.map(k => `system.${k}Increase`),
      "system.attributeIncrease",
      "system.innateRanks",
      "system.appearance",
      "system.description",
    ];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._traitTags];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return ["system.size.enabled", ...super._displayToggles];
  }

  /**
   * Trait tags.
   * @returns {Teriock.Display.DisplayTag[]}
   */
  get _traitTags() {
    return Array.from(this.traits).map(t => {
      return { label: TERIOCK.reference.traits[t], tooltip: "TERIOCK.SYSTEMS.Species.FIELDS.traits.label" };
    });
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([...simplifyTags(this._traitTags), parts.text]);
    parts.subtitle = _loc("TYPES.Item.species");
    return parts;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Creature:${TERIOCK.index.creatures[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor && options.interactive) { this.#onCreateChangeSize(); }
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
    if (this.size.enabled && !this.size.value) { this.size.value = TERIOCK.config.system.baseValues.size; }
    super.prepareBaseData();
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
        height: TeriockActor.getSizeConfig(this.size.value).length,
        name: this.parent.name,
        ring: {
          enabled: this.transformation.ring,
          subject: { texture: this.transformation.ring ? this.transformation.img : undefined },
        },
        texture: { src: this.parent.img },
        width: TeriockActor.getSizeConfig(this.size.value).length,
      },
      system: {
        _src: this.parent.uuid,
        ...Object.fromEntries(POOL_STATS.map(k => [k, { value: systemConfig.inf }])),
        size: { value: this.size.value },
      },
      type: "creature",
    }, data);
  }
}
