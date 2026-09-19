import { HTMLAutocompleteInputElement } from "../../../../../applications/elements/_module.mjs";
import affinityConfig from "../../../../../constants/config/affinity-config.mjs";
import { icons } from "../../../../../constants/display/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../../helpers/icon.mjs";
import { localizeChoices } from "../../../../../helpers/localization.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { dotJoin, toKebabCase } from "../../../../../helpers/string.mjs";
import { objectMap } from "../../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../../fields/_module.mjs";
import { EmbeddableDataMixin, PanelDataMixin, UsableDataMixin } from "../../../../mixins/_module.mjs";
import { MechanicPseudoDocument } from "../../../abstract/_module.mjs";

const { fields } = foundry.data;

/** @type {Record<string, Record<Identifier, string>>} */
const IDENTIFIER_CHOICES = {};

/**
 * An affinity that some effect grants against a specific thing.
 *
 * Relevant wiki pages:
 * - [Affinity keywords](https://wiki.teriock.com/index.php?title=Category:Affinity_keywords)
 *
 * @mixes PanelData
 * @mixes UsableData
 * @mixes EmbeddableData
 * @property {BaseEffectSystem} parent
 * @property {TeriockActiveEffect} document
 */
export default class BaseAffinity
  extends mixClasses(MechanicPseudoDocument, PanelDataMixin, UsableDataMixin, EmbeddableDataMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Base"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "Affinity",
    icon: icons.manifest.pseudoDocument.affinity,
    typed: true,
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.AffinityExecution;
  }

  /** @inheritDoc */
  static get TYPE_MODELS() {
    return this.getTypeModels(teriock.data.pseudoDocuments.affinities);
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      category: new fields.StringField({
        choices: localizeChoices(objectMap(affinityConfig.categories, c => c.label)),
        initial: "abilities",
        required: true,
      }),
      identifier: new IdentifierField({ label: _loc("TERIOCK.COMMON.Identifier") }),
      img: new fields.FilePathField({ blank: true, categories: ["IMAGE"], initial: null, nullable: true }),
      name: new fields.StringField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (source.category === "statuses") { source.category = "conditions"; }
    if ("value" in source) {
      if (source.category === "other") { source.name ??= source.value; }
      else { source.identifier ??= toKebabCase(source.value); }
      delete source.value;
    }
    return super.migrateData(source, options);
  }

  /** @type {string|null} */
  #sourceName = null;

  /**
   * The config for this affinity.
   * @returns {object}
   */
  get #config() {
    return affinityConfig.types[this.type];
  }

  /**
   * Valid values for this affinity's category.
   * @returns {Record<string, string>}
   */
  get _choices() {
    if (this.category === "other") { return {}; }
    const path = TERIOCK.config.affinity.categories[this.category]?.choices;
    if (!path) { return {}; }
    IDENTIFIER_CHOICES[path] ??= Object.fromEntries(
      Object.entries(foundry.utils.getProperty(TERIOCK, path) || {}).map(([k, v]) => [toKebabCase(k), v]),
    );
    return IDENTIFIER_CHOICES[path];
  }

  /**
   * The image this falls back to when none is set.
   * @returns {string}
   */
  get _defaultImg() {
    const fallback = this.getNearestDocument()?.img ?? TERIOCK.config.affinity.types[this.type].img;
    if (this.category === "other") { return fallback; }
    return getImage(TERIOCK.config.affinity.categories[this.category]?.imgCategory, this.identifier, fallback);
  }

  /**
   * The name this falls back to when none is set.
   * @returns {string}
   */
  get _defaultName() {
    if (this.category === "other") { return ""; }
    return this._choices[this.identifier] || this.identifier;
  }

  /**
   * @inheritDoc
   * @todo Deal with this duplicated code.
   */
  get _embedActions() {
    return Object.assign(super._embedActions, {
      useDoc: {
        primary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
        secondary: async (event, relative) => await this.use({ actor: relative?.actor, event }),
      },
    });
  }

  /** @inheritDoc */
  get _embedIcons() {
    if (!this.#config.competence) { return []; }
    const level = TERIOCK.config.competence.levels[this.getCompetence()];
    return [{ icon: level?.icon, tooltip: level?.label }];
  }

  /** @inheritDoc */
  get _formPaths() {
    if (this.category === "other") { return ["category", "name", "img"]; }
    return ["category", "identifier", "name", "img"];
  }

  /**
   * The label for the kind of thing this affinity is against.
   * @returns {string}
   */
  get categoryLabel() {
    return _loc(TERIOCK.config.affinity.categories[this.category]?.label ?? "");
  }

  /**
   * A color for this.
   * @returns {Color}
   */
  get color() {
    return foundry.utils.Color.from(this.#config?.color);
  }

  /** @inheritDoc */
  get embedParts() {
    return {
      action: "useDoc",
      color: this.color,
      draggable: false,
      icons: this._embedIcons,
      identifier: this.typedIdentifier,
      img: this.img,
      openable: true,
      subtitle: dotJoin([this.typeLabel, this.categoryLabel]),
      text: this.sourceName,
      title: this.name,
      usable: true,
      uuid: this.uuid,
    };
  }

  /**
   * If this is a protection.
   * @returns {boolean}
   */
  get protection() {
    return Boolean(this.#config.protection);
  }

  /**
   * The name of the source of this.
   * @returns {string}
   */
  get sourceName() {
    if (this.getNearestDocument()?.documentName === "Actor") { return this.#sourceName || ""; }
    return this.getNearestDocument().fullName || this.getNearestDocument().name || "";
  }

  /**
   * The name of the source of this.
   * @param {string|null} name
   */
  set sourceName(name) {
    this.#sourceName = name;
  }

  /**
   * The identifier for this type of affinity.
   * @returns {TypedIdentifier}
   */
  get typedIdentifier() {
    return this.#config.identifier;
  }

  /**
   * The label for this type of affinity.
   * @returns {string}
   */
  get typeLabel() {
    const label = _loc(this.#config?.label ?? "");
    if (!this.#config?.stacking) { return label; }
    return _loc("TERIOCK.SHEETS.Actor.TABS.Affinities.stackingLabel", { amount: this.amount, label });
  }

  /**
   * Whether this affinity points at a real thing and should be applied.
   * @returns {boolean}
   */
  get valid() {
    if (this.category === "other") { return Boolean(this.name); }
    return Boolean(this._choices[this.identifier]);
  }

  /**
   * If this is a weakness.
   * @returns {boolean}
   */
  get weakness() {
    return Boolean(this.#config.weakness);
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "identifier") {
      Object.assign(inputConfig, {
        choices: this._choices,
        name: `${this.localPath}.${path}`,
        value: foundry.utils.getProperty(this, `_source.${path}`),
      });
      foundry.data.fields.StringField._prepareChoiceConfig(inputConfig);
      groupConfig.input = HTMLAutocompleteInputElement.create(inputConfig);
    }
    if (path === "img") { inputConfig.placeholder = this._defaultImg; }
    if (path === "name") { inputConfig.placeholder = this._defaultName; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /** @inheritDoc */
  async _use(data = {}, options = {}) {
    options.competence = this.getCompetence();
    options.source = this;
    return super._use(data, options);
  }

  /** @inheritDoc */
  getEmbedContextMenuEntries(_relative) {
    // TODO: Fix source handling of affinities generated by statuses
    return [{
      group: "open",
      icon: makeIcon(TERIOCK.display.icons.manifest.ui.openWindow, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
      onClick: async () => await this.getNearestDocument().sheet.render(true),
    }];
  }

  /** @inheritDoc */
  async getPanelParts() {
    const page = await teriock.fromIdentifier(this.typedIdentifier);
    return Object.assign(await page?.getPanelParts?.() ?? {}, {
      bars: [{
        icon: TERIOCK.display.icons.manifest.pseudoDocument.affinity,
        label: this.name,
        wrappers: [this.typeLabel, this.categoryLabel, this.name].filter(Boolean),
      }],
      color: this.color,
      icon: TERIOCK.display.icons.manifest.pseudoDocument.affinity,
      img: this.img,
      name: this.name,
    });
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    if (!this.name) { this.name = this._defaultName; }
    if (!this.img) { this.img = this._defaultImg; }
  }
}
