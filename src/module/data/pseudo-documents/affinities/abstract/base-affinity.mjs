import affinityConfig from "../../../../constants/config/affinity-config.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { getImage } from "../../../../helpers/path.mjs";
import { objectMap, parseIdentifier } from "../../../../helpers/utils.mjs";
import MechanicPseudoDocument from "../../abstract/mechanic-pseudo-document.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * An affinity that some effect grants against a specific thing.
 * @extends {Teriock.Affinities.BaseAffinityData}
 * @extends {MechanicPseudoDocument}
 * @mixes CritMechanic
 * @property {AnyActiveEffect} document
 * @property {BaseEffectSystem} parent
 * @property {ID<BaseAffinity>} _id
 * @property {Teriock.Affinities.Type} type
 * @property {Teriock.Keys.AffinityCategory} category
 * @property {string} value
 * @property {string} img
 */
export default class BaseAffinity extends CritMechanicMixin(MechanicPseudoDocument) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AFFINITIES.Base"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AFFINITIES.Base.LABEL";
  }

  /**
   * @inheritDoc
   * @returns {{ documentName: "Affinity" }}
   */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "Affinity", label: _loc("TERIOCK.AFFINITIES.Base.LABEL") });
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

  /**
   * Configuration for this affinity's category.
   * @returns {object}
   */
  get _categoryConfig() {
    return affinityConfig.categories[this.category] || {};
  }

  /**
   * Valid values for this affinity's category.
   * @returns {Record<string, string>}
   */
  get _choices() {
    if (this.category === "other") { return {}; }
    return foundry.utils.getProperty(TERIOCK, this._categoryConfig.choices || {}) || {};
  }

  /**
   * Configuration for this affinity's type.
   * @returns {object}
   */
  get _config() {
    return affinityConfig.types[this.type] || {};
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["category", "value", "img"];
  }

  /**
   * The competence this affinity applies at. Affinities that do not care about competence sit at the maximum so that
   * they never lose to a competing source.
   * @returns {Teriock.System.CompetenceLevel}
   */
  get effectiveCompetence() {
    return 2;
  }

  /**
   * The image representing this affinity, preferring an explicit override.
   * @returns {string}
   */
  get effectiveImg() {
    if (this.img) { return this.img; }
    const fallback = getImage(this._config.imgCategory, parseIdentifier(this._config.identifier).identifier);
    if (this.category === "other") { return fallback; }
    return getImage(this._categoryConfig.imgCategory, this.value, fallback);
  }

  /**
   * Whether this affinity points at a real thing and should be applied.
   * @returns {boolean}
   */
  get valid() {
    if (!this.value) { return false; }
    return this.category === "other" || Boolean(this._choices[this.value]);
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}) {
    if (this.category !== "other" && path.endsWith("value")) { inputConfig.choices = this._choices; }
    return super._makeFormGroup(path, groupConfig, inputConfig);
  }

  /**
   * The amount this affinity contributes to an actor's total. Only meaningful for stacking affinities.
   * @returns {number}
   */
  getAmount() {
    return 0;
  }

  /**
   * The data an actor stores for this affinity.
   * @returns {Teriock.Affinities.EntryData}
   */
  toEntry() {
    return {
      _img: this.effectiveImg,
      amount: this.getAmount(),
      category: this.category,
      competence: this.effectiveCompetence,
      providers: [this.document?.name].filter(Boolean),
      type: this.type,
      value: this.value,
    };
  }
}
