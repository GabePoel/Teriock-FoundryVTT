import mathConfig from "../../../../constants/config/math-config.mjs";
import { ExpirationExecution } from "../../../../executions/child-executions/_module.mjs";
import { buildWriteOperation, consolidateWriteOperations, objectMap } from "../../../../helpers/utils.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import MechanicPseudoDocument from "../../abstract/mechanic-pseudo-document.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";

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

  /**
   * Attempt to expire each applicable ActiveEffect on an array of Actors.
   * @param {TeriockActor[]} actors - Actors to check the Expirations of
   * @param {Teriock.Expirations.Type} type - The type of Expiration to check
   * @param {object} context - Any context relevant to the type of Expiration we check
   * @param {boolean} delegate - Whether to delegate the rolls to each Actor's default User
   * @returns {Promise<void>}
   */
  static async massExpire(actors, type, context, delegate = false) {
    const effects = actors.flatMap(actor =>
      actor.applicables.filter(effect =>
        effect.active && effect.system.activeExpirations.some((e) => e.attempt(type, context, delegate))
      )
    );
    if (!effects.length) { return; }
    const operations = await Promise.all(
      effects.map(async (e) =>
        buildWriteOperation({
          action: CONFIG.ActiveEffect.expiryAction,
          docData: { "duration.expired": true },
          uuid: e.uuid,
        })
      ),
    );
    const consolidatedOperations = consolidateWriteOperations(operations.filter(Boolean));
    await foundry.documents.modifyBatch(consolidatedOperations);
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
   * Validate an expiration attempt.
   * @param {Teriock.Expirations.Type} type
   * @param {object} _context
   * @returns {boolean}
   */
  _validateExpirationAttempt(type, _context) {
    return type === this.type;
  }

  /**
   * Attempt to expire.
   * @param {Teriock.Expirations.Type} type
   * @param {object} context
   * @param {boolean} delegate
   * @returns {boolean} Whether this should expire but didn't manage its own handling.
   */
  attempt(type, context, delegate) {
    if (this._validateExpirationAttempt(type, context)) {
      if (this.method === "roll") {
        if (delegate) { this.actor.defaultUser.query("teriock.use", { uuid: this.uuid }); }
        else { this.use(); }
      } else { return true; }
    }
    return false;
  }

  /**
   * Use this expiration.
   * @returns {Promise<void>}
   */
  async use() {
    if (this.method === "roll") {
      await ExpirationExecution.create({}, { actor: this.actor, expiration: this, source: this.document });
    } else { await this.document.system.expire(); }
  }
}
