import mathConfig from "../../../../constants/config/math-config.mjs";
import { ExpirationExecution } from "../../../../executions/document-executions/_module.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import MechanicPseudoDocument from "../../abstract/mechanic-pseudo-document.mjs";
import { CritMechanicMixin } from "../../abstract/mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} ExpirationEventContext
 * @property {Set<TeriockActor>} [actors]
 * @property {Set<UUID<BaseExpiration>>} [cleanup]
 * @property {string} [type]
 */

/**
 * @extends {Teriock.Expirations.BaseExpirationData}
 * @extends {MechanicPseudoDocument}
 * @property {AnyActiveEffect} document
 * @property {BaseEffectSystem} parent
 * @property {ID<BaseExpiration>} _id
 * @property {Teriock.Expirations.Type} type
 */
export default class BaseExpiration extends CritMechanicMixin(MechanicPseudoDocument) {
  /**
   * The expiry event used for expiration refreshes.
   * @type {string}
   */
  static EXPIRY_REFRESH_EVENT = "expirationRefresh";

  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Base"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Base.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "Expiration", label: _loc("TERIOCK.EXPIRATIONS.Base.LABEL") });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      method: new fields.StringField({
        blank: false,
        choices: {
          automatic: _loc("TERIOCK.EXPIRATIONS.Base.METHOD.automatic"),
          roll: _loc("TERIOCK.EXPIRATIONS.Base.METHOD.roll"),
        },
        initial: "automatic",
        required: true,
      }),
      roll: new fields.SchemaField({
        comparison: new fields.StringField({
          blank: false,
          choices: objectMap(mathConfig.comparisons, (c) => c.label, { localize: true }),
          initial: "gte",
          required: true,
        }),
        formula: new rollableFormulaField({ initial: "2d4kh1" }),
        threshold: new FormulaField({ initial: "4" }),
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["method", ...this._formPathsRoll, "hr"];
  }

  /**
   * Roll form paths.
   * @returns {string[]}
   */
  get _formPathsRoll() {
    if (this.method === "roll") { return ["roll.formula", "roll.comparison", "roll.threshold"]; }
    return [];
  }

  /**
   * Expiration-specific handling expiry event determination. This check is independent of whether the duration was also
   * reached.
   * @param {string} event
   * @param {ExpirationEventContext} context
   * @returns {boolean|null}
   */
  isExpiryEvent(event, context = {}) {
    if (!this.isValidEvent(event, context)) { return false; }
    const isRoll = this.isRollEvent(event, context);
    if (isRoll) { this.use(); }
    else { this.document.duration.remaining = 0; }
    return !isRoll;
  }

  /**
   * Check if the event should invoke a roll.
   * @param {string} event
   * @param {ExpirationEventContext} context
   * @returns {boolean}
   */
  isRollEvent(event, context = {}) {
    return (this.method === "roll" && event === this.constructor.EXPIRY_REFRESH_EVENT
      && this.isValidEvent(event, context));
  }

  /**
   * Check if the event is valid.
   * @param {string} event
   * @param {ExpirationEventContext} context
   * @returns {boolean}
   */
  isValidEvent(event, context = {}) {
    return (context.type === this.type && event === this.constructor.EXPIRY_REFRESH_EVENT);
  }

  /**
   * Use this expiration.
   * @returns {Promise<void>}
   */
  async use() {
    if (this.method === "roll") {
      await ExpirationExecution.create({ actor: this.actor, expiration: this, source: this.document });
    } else { await this.document.system.expire(); }
  }
}
