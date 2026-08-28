import { TeriockContextMenu } from "../../../../../applications/ux/_module.mjs";
import affinityConfig from "../../../../../constants/config/affinity-config.mjs";
import { makeIcon } from "../../../../../helpers/icon.mjs";
import { localizeChoices } from "../../../../../helpers/localization.mjs";
import { getImage } from "../../../../../helpers/path.mjs";
import { dotJoin } from "../../../../../helpers/string.mjs";
import { objectMap } from "../../../../../helpers/utils.mjs";
import { PanelDataMixin } from "../../../../mixins/_module.mjs";
import { MechanicPseudoDocument } from "../../../abstract/_module.mjs";
import { CritMechanicMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * An affinity that some effect grants against a specific thing.
 * @implements Teriock.Embeds.Embeddable
 * @mixes CritMechanic
 * @mixes PanelData
 * @property {BaseEffectSystem} parent
 * @property {TeriockActiveEffect} document
 */
export default class BaseAffinity extends PanelDataMixin(CritMechanicMixin(MechanicPseudoDocument)) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Base"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AFFINITIES.Base.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, {
      documentName: "Affinity",
      icon: TERIOCK.display.icons.pseudoDocument.affinity,
      label: _loc("TERIOCK.AFFINITIES.Base.LABEL"),
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      category: new fields.StringField({
        choices: localizeChoices(objectMap(affinityConfig.categories, c => c.label)),
        initial: "abilities",
        required: true,
      }),
      img: new fields.FilePathField({ blank: true, categories: ["IMAGE"], initial: null, nullable: true }),
      value: new fields.StringField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (source.category === "statuses") { source.category = "conditions"; }
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
    return foundry.utils.getProperty(TERIOCK, TERIOCK.config.affinity.categories[this.category]?.choices || {}) || {};
  }

  /** @inheritDoc */
  get _embedIcons() {
    if (!this.#config.competence) { return []; }
    const level = TERIOCK.config.competence.levels[this.getCompetence()];
    return [{ icon: level?.icon, tooltip: level?.label }];
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["category", "value", "img"];
  }

  /**
   * The label for the kind of thing this affinity is against.
   * @returns {string}
   */
  get categoryLabel() {
    return _loc(TERIOCK.config.affinity.categories[this.category]?.label ?? "");
  }

  /** @inheritDoc */
  get embedParts() {
    return {
      draggable: false,
      icons: this._embedIcons,
      identifier: this.typedIdentifier,
      img: this.img,
      openable: true,
      subtitle: dotJoin([this.typeLabel, this.categoryLabel]),
      text: this.sourceName,
      title: this.name,
      uuid: this.uuid,
    };
  }

  /** @inheritDoc */
  get name() {
    if (this.category === "other") { return this.value; }
    return this._choices[this.value] || this.value;
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
    if (this.document?.documentName === "Actor") { return this.#sourceName || ""; }
    return this.document.fullName || this.document.name || "";
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
    if (!this.value) { return false; }
    return this.category === "other" || Boolean(this._choices[this.value]);
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
    if (this.category !== "other" && path.endsWith("value")) { inputConfig.choices = this._choices; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /**
   * The amount this affinity contributes to an actor's total. Only meaningful for stacking affinities.
   * @returns {number}
   */
  getAmount() {
    return 0;
  }

  /** @inheritDoc */
  getEmbedContextMenuEntries(_relative) {
    // TODO: Fix source handling of affinities generated by statuses
    return [{
      group: "open",
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
      onClick: async () => await this.document.sheet.render(true),
    }];
  }

  /** @inheritDoc */
  async getPanelParts() {
    const page = await teriock.fromIdentifier(this.typedIdentifier);
    return Object.assign(await page?.getPanelParts?.() ?? {}, {
      bars: [{
        icon: TERIOCK.display.icons.pseudoDocument.affinity,
        label: this.name,
        wrappers: [this.typeLabel, this.categoryLabel, this.name].filter(Boolean),
      }],
      color: foundry.utils.Color.from(this.#config?.colot),
      icon: TERIOCK.display.icons.pseudoDocument.affinity,
      img: this.img,
      name: this.name,
    });
  }

  /**
   * @inheritDoc
   * @todo Remove duplicated {@link VirtualCondition} code
   */
  onEmbed(element) {
    const menuEntries = this.getEmbedContextMenuEntries();
    if (!menuEntries.length) {
      return;
    }
    element.addEventListener("contextmenu", (event) => {
      const action = /** @type {HTMLElement} */ (event.target).closest("[data-action]")?.dataset.action;
      if (action && action === this.embedParts.action) {
        event.stopImmediatePropagation();
      }
    });
    new TeriockContextMenu(element, ".teriock-block", menuEntries, {
      eventName: "contextmenu",
      fixed: true,
      jQuery: false,
    });
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    if (!this.img) {
      /** @type {string} */
      const fallback = this.document?.img ?? TERIOCK.config.affinity.types[this.type].img;
      if (this.category === "other") { this.img = fallback; }
      else { this.img = getImage(
          TERIOCK.config.affinity.categories[this.category]?.imgCategory,
          this.value,
          fallback,
        ); }
    }
  }

  /**
   * The data an actor stores for this affinity.
   * @returns {Teriock.Affinities.EntryData}
   */
  toEntry() {
    return {
      amount: this.getAmount(),
      category: this.category,
      competence: this.getCompetence(),
      img: this.img,
      providers: [this.document?.name].filter(Boolean),
      sources: [this.document?.uuid].filter(Boolean),
      type: this.type,
      value: this.value,
    };
  }
}
