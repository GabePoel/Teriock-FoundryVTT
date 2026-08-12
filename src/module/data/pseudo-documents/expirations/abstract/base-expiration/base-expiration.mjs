import mathConfig from "../../../../../constants/config/math-config.mjs";
import { ExpirationExecution } from "../../../../../executions/child-executions/_module.mjs";
import { objectMap } from "../../../../../helpers/utils.mjs";
import { FormulaField } from "../../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../../fields/tools/builders.mjs";
import MechanicPseudoDocument from "../../../abstract/mechanic-pseudo-document/mechanic-pseudo-document.mjs";
import { ExpirationActivation } from "../../../activations/_module.mjs";
import { CritMechanicMixin } from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @typedef {object} ExpirationEventContext
 * @property {Set<TeriockActor>} [actors]
 * @property {Set<UUID<BaseExpiration>>} [cleanup]
 * @property {string} [type]
 * @property {TeriockActiveEffect} document
 * @property {BaseEffectSystem} parent
 * @property {ID<BaseExpiration>} _id
 * @property {ExpirationType} type
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
        threshold: new FormulaField({ initial: "4", placeholder: "0" }),
      }),
    });
  }

  /**
   * Attempt to expire each applicable ActiveEffect on an array of Actors.
   * @param {TeriockActor[]} actors - Actors to check the Expirations of
   * @param {ExpirationType} type - The type of Expiration to check
   * @param {object} context - Any context relevant to the type of Expiration we check
   * @returns {Promise<void>}
   */
  static async massExpire(actors, type, context) {
    for (const actor of actors) {
      const scope = { chatDataBySource: {} };
      for (const effect of actor.applicables) {
        if (!effect.active) { continue; }
        for (const expiration of effect.system.activeExpirations) {
          const activation = expiration.attempt(type, context);
          if (!activation) { continue; }
          const key = effect.uuid;
          scope.chatDataBySource[key] ??= actor.prepareTriggeredChatData(
            expiration.getTriggerLabel(context),
            effect,
            "expiration",
          );
          teriock.data.systems.messages.TriggeredSystem.addActivations(scope.chatDataBySource[key], [activation]);
        }
      }
      await actor.createTriggeredMessages(scope);
    }
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
   * @param {ExpirationType} type
   * @param {object} _context
   * @returns {boolean}
   */
  _validateExpirationAttempt(type, _context) {
    return type === this.type;
  }

  /**
   * Attempt this expiration for a given event.
   * @param {ExpirationType} type
   * @param {object} context
   * @returns {ExpirationActivation|null} An activation that resolves this expiration, if it applies.
   */
  attempt(type, context) {
    if (!this._validateExpirationAttempt(type, context)) { return null; }
    return new ExpirationActivation({ expiration: this.uuid });
  }

  /**
   * A label for the triggered chat message panel header.
   * @param {object} _context
   * @returns {string}
   */
  getTriggerLabel(_context) {
    return this.label;
  }

  /**
   * Use this expiration.
   * @returns {Promise<void>}
   */
  async use() {
    if (this.method === "roll") {
      await ExpirationExecution.create({}, { actor: this.actor, expiration: this, source: this.document });
    } else { await this.document.system.expire({ dialog: true }); }
  }
}
