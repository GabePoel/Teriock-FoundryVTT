import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { TeriockActor } from "../../../../documents/_module.mjs";
import statConfig from "../../../../static/config/stat-config.mjs";
import { INF } from "../../../../static/const.mjs";
import { icons } from "../../../../static/display/_module.mjs";
import { dotJoin, makeIconClass, mergeMetadata, mixClasses, safeInf, toKebabCase } from "../../../../utils/_module.mjs";
import { InfiniteNumberField } from "../../../fields/_module.mjs";
import { identifierSetField } from "../../../fields/tools/builders.mjs";
import { migrateIterables } from "../../../fields/tools/migrations.mjs";
import { validateNonZero } from "../../../fields/tools/validators.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { CompetenceDisplaySystemMixin, StatGiverSystemMixin, WikiSystemMixin } from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";
import { SpeciesPanelPart, SpeciesTransformationPart } from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { ActorData } from "@common/documents/_types.mjs";
 */

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {BaseItemSystem}
 * @mixes WikiSystem
 * @mixes CompetenceDisplaySystem
 * @mixes StatGiverSystem
 * @mixes SpeciesPanelPart
 * @mixes SpeciesTransformationPart
 */
export default class SpeciesSystem
  extends mixClasses(
    BaseItemSystem,
    WikiSystemMixin,
    CompetenceDisplaySystemMixin,
    StatGiverSystemMixin,
    SpeciesPanelPart,
    SpeciesTransformationPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Species"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["ability", "body", "equipment", "fluency", "rank", "resource"],
    icon: icons.manifest.document.species,
    importDialog: true,
    initialCompetence: 1,
    type: "species",
    visibleTypes: ["ability", "body", "equipment", "fluency", "rank", "resource"],
  });

  /** @inheritDoc */
  static get _automationTypes() {
    return [...super._automationTypes, automations.ToggleChildrenAutomation];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      appearance: new fields.HTMLField(),
      attributeIncrease: new fields.HTMLField(),
      br: new fields.NumberField({ initial: 1 }),
      description: new fields.HTMLField(),
      innateRanks: new fields.HTMLField(),
      lifespan: new fields.SchemaField({
        adulthood: new fields.NumberField({ initial: 0, min: 0, placeholder: _loc("COMMON.None") }),
        enabled: new fields.BooleanField({ initial: false }),
        max: new InfiniteNumberField(),
      }),
      ...Object.fromEntries(POOL_STATS.map(k => [`${k}Increase`, new fields.HTMLField()])),
      size: new fields.SchemaField({
        enabled: new fields.BooleanField({ initial: true }),
        max: new fields.NumberField({ placeholder: _loc("COMMON.None") }),
        min: new fields.NumberField({ placeholder: _loc("COMMON.None") }),
        value: new fields.NumberField({
          initial: TERIOCK.CONFIG.system.baseValues.size,
          min: 0,
          nullable: false,
          placeholder: `${TERIOCK.CONFIG.system.baseValues.size}`,
          validate: validateNonZero,
          validationError: _loc("TERIOCK.SYSTEMS.Species.FIELDS.size.value.zeroValidationError"),
        }),
      }),
      traits: identifierSetField(TERIOCK.CONFIG.species.traits),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateIterables(source, "traits");
    if (
      ("adult" in source || typeof source.lifespan === "number") && foundry.utils.getType(source.lifespan) !== "Object"
    ) {
      source.lifespan = { adulthood: source.adult, enabled: Boolean(source.adult), max: source.lifespan || null };
    }
    return super.migrateData(source, options);
  }

  /**
   * Offer to resize the actor to match the size this species specifies.
   * @returns {Promise<void>}
   */
  async #onChangeSize() {
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
        icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui.confirm, "title"),
        title: _loc("TERIOCK.DIALOGS.ChangeSize.title"),
      },
    });
    if (proceed) { await actor.update({ "system.size.value": this.size.value }); }
  }

  /** @inheritDoc */
  get _displayFieldsContent() {
    return [
      ...POOL_STATS.map(k => `system.${k}Increase`),
      "system.attributeIncrease",
      "system.innateRanks",
      "system.appearance",
      ...super._displayFieldsContent,
    ];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._traitTags];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return ["system.lifespan.enabled", "system.size.enabled", ...super._displayToggles];
  }

  /**
   * Trait tags.
   * @returns {Teriock.Display.DisplayTag[]}
   */
  get _traitTags() {
    return Array.from(this.traits).map(t => {
      return { label: TERIOCK.CONFIG.species.traits[t]?.label, tooltip: "TERIOCK.SYSTEMS.Species.FIELDS.traits.label" };
    });
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([...Panel.simplifyTags(this._traitTags), parts.text]);
    parts.subtitle = _loc("TYPES.Item.species");
    return parts;
  }

  /**
   * @inheritDoc
   * @returns {TypedIdentifier|null}
   */
  get wikiIdentifier() {
    return this.identifier ? `creature:${this.identifier}` : null;
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (
      this.parent.checkEditor(userId) && this.actor && options.interactive
      && this.parent.master?.documentName === "Actor"
    ) { this.#onChangeSize(); }
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (
      this.parent.checkEditor(userId) && foundry.utils.hasProperty(changed, "system.size.value") && this.actor
      && options.interactive && this.parent.master?.documentName === "Actor"
    ) {
      this.#onChangeSize();
    }
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = super.getLocalRollData();
    Object.assign(data, {
      br: this.br,
      lifespan: this.lifespan.enabled ? this.lifespan.max : 0,
      "lifespan.adulthood": this.lifespan.enabled ? this.lifespan.adulthood : 0,
      "lifespan.enabled": Number(this.lifespan.enabled),
      "lifespan.max": this.lifespan.enabled ? safeInf(this.lifespan.max) : 0,
      size: this.size.enabled ? this.size.value : 0,
      "size.enabled": Number(this.size.enabled),
      "size.max": this.size.enabled ? this.size.max : 0,
      "size.min": this.size.enabled ? this.size.min : 0,
    });
    for (const trait of this.traits) { data[`trait.${toKebabCase(trait)}`] = 1; }
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
    if (this.size.enabled && !this.size.value) { this.size.value = TERIOCK.CONFIG.system.baseValues.size; }
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
      items: [this.parent.toObject()],
      name: this.parent.name,
      prototypeToken: {
        height: TeriockActor.getSizeConfig(this.size.value).length,
        name: this.parent.name,
        ring: { enabled: this.transformation.ring, subject: { texture: this.transformation.ringImg } },
        texture: { src: this.parent.img },
        width: TeriockActor.getSizeConfig(this.size.value).length,
      },
      system: {
        _src: this.parent.uuid,
        ...Object.fromEntries(POOL_STATS.map(k => [k, { value: INF }])),
        size: { value: this.size.value },
      },
      type: "creature",
    }, data);
  }
}
