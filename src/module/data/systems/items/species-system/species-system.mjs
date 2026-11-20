import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { TeriockActor } from "../../../../documents/_module.mjs";
import { dotJoin, makeIconClass, mergeMetadata, mixClasses, safeInf } from "../../../../utils/_module.mjs";
import { slugSetField } from "../../../fields/tools/builders.mjs";
import { validateNonZero } from "../../../fields/tools/validators.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";
import {
  AppearanceSystemMixin,
  CompetenceDisplaySystemMixin,
  MetaphysicsSystemMixin,
  StattedSystemMixin,
  WikiSystemMixin,
} from "../../mixins/_module.mjs";
import { BaseItemSystem } from "../abstract/_module.mjs";
import { SpeciesMorphPart, SpeciesPanelPart } from "./parts/_module.mjs";

const { fields } = foundry.data;

/**
 * @import { ActorData } from "@common/documents/_types.mjs";
 */

const POOL_STATS = Object.keys(TERIOCK.CONFIG.stat).filter(k => TERIOCK.CONFIG.stat[k].pool?.enabled);

/**
 * Species-specific item data model.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {BaseItemSystem}
 * @mixes AppearanceSystem
 * @mixes WikiSystem
 * @mixes CompetenceDisplaySystem
 * @mixes MetaphysicsSystem
 * @mixes StattedSystem
 * @mixes SpeciesPanelPart
 * @mixes SpeciesMorphPart
 */
export default class SpeciesSystem
  extends mixClasses(
    BaseItemSystem,
    AppearanceSystemMixin,
    WikiSystemMixin,
    CompetenceDisplaySystemMixin,
    MetaphysicsSystemMixin,
    StattedSystemMixin,
    SpeciesPanelPart,
    SpeciesMorphPart,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Species"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    automationTags: { species: true },
    childTypes: ["ability", "body", "equipment", "fluency", "rank", "resource"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.species,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.species,
    importable: true,
    initialCompetence: 1,
    type: "species",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attributeIncrease: new fields.HTMLField(),
      br: new fields.NumberField({ initial: 1 }),
      innateRanks: new fields.HTMLField(),
      lifespan: new fields.SchemaField({
        adulthood: new fields.NumberField({ initial: 0, min: 0, placeholder: _loc("COMMON.None") }),
        enabled: new fields.BooleanField({ initial: false }),
        max: new fields.ExtendedNumberField({ min: 0, required: true }),
      }),
      ...Object.fromEntries(POOL_STATS.map(k => [`${k}Increase`, new fields.HTMLField()])),
      size: new fields.SchemaField({
        enabled: new fields.BooleanField({ initial: true }),
        max: new fields.NumberField({ placeholder: _loc("COMMON.None") }),
        min: new fields.NumberField({ placeholder: _loc("COMMON.None") }),
        value: new fields.NumberField({
          initial: TERIOCK.CONFIG.actor.defaults.size,
          min: 0,
          nullable: false,
          placeholder: `${TERIOCK.CONFIG.actor.defaults.size}`,
          validate: validateNonZero,
          validationError: _loc("TERIOCK.SYSTEMS.Species.FIELDS.size.value.zeroValidationError"),
        }),
      }),
      traits: slugSetField(TERIOCK.CONFIG.species.traits),
    });
  }

  /**
   * Abilities made non-proficient by a minor transformation during data preparation.
   * @type {TeriockActiveEffect<"ability">[]}
   */
  #minorAbilities = [];

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
  get _color() {
    const color = { 1: "blue", 2: "green", 3: "purple" }[this.transformationLevel];
    return color ? TERIOCK.DISPLAY.colors.palette[color] : super._color;
  }

  /** @inheritDoc */
  get _displayFieldsContent() {
    return [
      ...[...POOL_STATS.map(k => `system.${k}Increase`), "system.attributeIncrease", "system.innateRanks"].map(
        path => ({ path, subgroup: "upgrades" })
      ),
      ...super._displayFieldsContent,
    ];
  }

  /** @inheritDoc */
  get _displayInputs() {
    return [...super._displayInputs, "system.traits"];
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

  /** @inheritDoc */
  get wikiIdentifier() {
    return `creature:${this.slug}`;
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
      lifespan: this.lifespan.enabled ? safeInf(this.lifespan.max) : 0,
      "lifespan.adulthood": this.lifespan.enabled ? this.lifespan.adulthood : 0,
      "lifespan.enabled": Number(this.lifespan.enabled),
      "lifespan.max": this.lifespan.enabled ? safeInf(this.lifespan.max) : 0,
      size: this.size.enabled ? this.size.value : 0,
      "size.enabled": Number(this.size.enabled),
      "size.max": this.size.enabled ? this.size.max : 0,
      "size.min": this.size.enabled ? this.size.min : 0,
    });
    for (const trait of this.traits) { data[`trait.${trait}`] = 1; }
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
    if (this.size.enabled && !this.size.value) { this.size.value = TERIOCK.CONFIG.actor.defaults.size; }
    super.prepareBaseData();
    // Abilities from minor transformations are not proficient.
    this.#minorAbilities = [];
    if (this.transformationLevel === 1) {
      for (const a of this.parent.previewed.getTypeSync("ability")) {
        if (a.system.lockedPaths.has("system.competence.raw")) { continue; }
        a.system.competence.raw = 0;
        this.#minorAbilities.push(a);
      }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const a of this.#minorAbilities) {
      foundry.utils.setProperty(a.overrides, "system.competence.raw", 0);
    }
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
        ring: { enabled: this.morph.ring, subject: { texture: this.morph.ringImg } },
        texture: { src: this.parent.img },
        width: TeriockActor.getSizeConfig(this.size.value).length,
      },
      system: {
        ...Object.fromEntries(POOL_STATS.map(k => [k, { value: TERIOCK.CONST.INF }])),
        size: { value: this.size.value },
      },
      type: "creature",
    }, data);
  }
}
