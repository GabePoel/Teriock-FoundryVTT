import mathConfig from "../../../../constants/config/math-config.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/helpers/builders.mjs";
import MechanicPseudoDocument from "../../abstract/mechanic-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @typedef {object} ExpirationEventContext
 * @property {Set<TeriockActor>} [actors]
 * @property {Set<UUID<BaseExpiration>>} [cleanup]
 * @property {string} [type]
 */

/**
 * @extends {Teriock.Expirations.BaseExpirationData}
 * @property {AnyActiveEffect} document
 * @property {BaseEffectSystem} parent
 * @property {ID<BaseExpiration>} _id
 * @property {Teriock.Expirations.Type} type
 * @todo Needs crit handling.
 */
export default class BaseExpiration extends MechanicPseudoDocument {
  /**
   * The expiry event which checks expiration cleanup.
   * @type {string}
   */
  static EXPIRY_CLEANUP_EVENT = "expirationCleanup";

  /**
   * The expiry event which checks expiration validation.
   * @type {string}
   */
  static EXPIRY_VALIDATION_EVENT = "expirationValidation";

  /**
   * The expiry events which interact with expirations.
   * @type {Set<string>}
   */
  static EXPIRY_EVENTS = new Set([this.EXPIRY_CLEANUP_EVENT, this.EXPIRY_VALIDATION_EVENT]);

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
    return !this.isRollEvent(event, context);
  }

  /**
   * Check if the event should invoke a roll.
   * @param {string} event
   * @param {ExpirationEventContext} context
   * @returns {boolean}
   */
  isRollEvent(event, context = {}) {
    return (this.method === "roll" && event === this.constructor.EXPIRY_VALIDATION_EVENT
      && this.isValidEvent(event, context));
  }

  /**
   * Check if the event is valid.
   * @param {string} event
   * @param {ExpirationEventContext} context
   * @returns {boolean}
   */
  isValidEvent(event, context = {}) {
    return (context.type === this.type && this.constructor.EXPIRY_EVENTS.has(event));
  }
}
