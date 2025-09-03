import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { getRollIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { migrateHierarchy } from "../../shared/migrations/migrate-hierarchy.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import * as sharedFields from "../shared/shared-fields.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 */
export default class TeriockConsequenceData extends TeriockBaseEffectData {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    childEffectTypes: ["ability", "property", "fluency"],
    hierarchy: true,
    type: "consequence",
    usable: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      source: new fields.StringField({ initial: "", nullable: true }),
      expirations: new fields.SchemaField({
        conditions: new fields.SchemaField({
          present: new fields.SetField(
            new fields.StringField({ choices: CONFIG.TERIOCK.index.conditions }),
            {
              label: "Present Conditions",
              hint: "What conditions must be present in order for this ability to be active?",
            },
          ),
          absent: new fields.SetField(
            new fields.StringField({ choices: CONFIG.TERIOCK.index.conditions }),
            {
              label: "Absent Conditions",
              hint: "What conditions must be absent in order for this ability to be active?",
            },
          ),
        }),
        movement: new fields.BooleanField({
          initial: false,
          label: "Stationary Expiration",
          hint: "If true, effect expires on movement.",
        }),
        dawn: new fields.BooleanField({
          initial: false,
          label: "Dawn Expiration",
          hint: "If true, effect expires at dawn.",
        }),
        sustained: new fields.BooleanField({
          initial: false,
          label: "Sustained Expiration",
          hint: "If true, effect expires if its source is deleted or disabled.",
        }),
        description: new fields.StringField({
          label: "End Condition",
          hint: "Under what circumstances should this effect expire?",
        }),
        combat: new fields.SchemaField({
          who: new fields.SchemaField({
            type: sharedFields.combatExpirationSourceTypeField(),
            source: new fields.DocumentUUIDField({
              type: "Actor",
              nullable: true,
              label: "Actor",
              hint: "UUID of actor whose turn or other information is used to trigger an expiration?",
            }),
          }),
          what: sharedFields.combatExpirationMethodField(),
          when: sharedFields.combatExpirationTimingField(),
        }),
      }),
      sourceDescription: new fields.HTMLField(),
      hierarchy: sharedFields.hierarchyField(),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrateHierarchy(data);
    return data;
  }

  /**
   * Checks if the effect has condition-based expiration.
   * @returns {boolean} True if the effect expires based on a condition, false otherwise.
   */
  get conditionExpiration() {
    return (
      this.expirations.conditions.present.size +
        this.expirations.conditions.absent.size >
      0
    );
  }

  /**
   * Checks if the effect expires at dawn.
   * @returns {boolean} True if the effect expires at dawn, false otherwise.
   */
  get dawnExpiration() {
    return this.expirations.dawn;
  }

  /**
   * Gets the maneuver type for this effect.
   * Effects are always passive maneuvers.
   * @returns {string} The maneuver type ("passive").
   */
  get maneuver() {
    return "passive";
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /**
   * Checks if the effect expires on movement.
   * @returns {boolean} True if the effect expires on movement, false otherwise.
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /** @inheritDoc */
  get shouldExpire() {
    let should = super.shouldExpire;
    if (this.conditionExpiration && this.actor) {
      const conditions = this.actor.statuses;
      for (const condition of this.expirations.conditions.present) {
        should = should || !conditions.has(condition);
      }
      for (const condition of this.expirations.conditions.absent) {
        should = should || conditions.has(condition);
      }
    }
    if (this.sustainedExpiration) {
      const source = fromUuidSync(this.source);
      should = should || !source || source.disabled;
    }
    return should;
  }

  /**
   * Checks if the effect expires when its source is deleted or disabled.
   * @returns {boolean} True if the effect expires when sustained, false otherwise.
   */
  get sustainedExpiration() {
    return this.expirations.sustained;
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.expirations.combat.what.roll);
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
  }

  /**
   * Trigger in-combat expiration.
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /** @inheritDoc */
  async roll(_options) {
    await this.inCombatExpiration(true);
  }
}
