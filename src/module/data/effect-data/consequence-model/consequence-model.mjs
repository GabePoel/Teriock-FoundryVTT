import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { getRollIcon, mix } from "../../../helpers/utils.mjs";
import { builders } from "../../fields/helpers/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import { migrateHierarchy } from "../../shared/migrations/migrate-hierarchy.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 * @extends {TeriockBaseEffectModel}
 * @mixes HierarchyData
 * @mixes TransformationData
 */
export default class TeriockConsequenceModel extends mix(
  TeriockBaseEffectModel,
  mixins.HierarchyDataMixin,
  mixins.TransformationDataMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "consequence",
      usable: true,
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      associations: builders.associationsField(),
      blocks: builders.blocksField(),
      critical: new fields.BooleanField({ initial: false }),
      source: new fields.StringField({
        initial: "",
        nullable: true,
      }),
      expirations: new fields.SchemaField({
        conditions: new fields.SchemaField({
          present: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
            {
              label: "Present Conditions",
              hint: "What conditions must be present in order for this ability to be active?",
            },
          ),
          absent: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
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
            type: builders.combatExpirationSourceTypeField(),
            source: new fields.DocumentUUIDField({
              type: "Actor",
              nullable: true,
              label: "Actor",
              hint: "UUID of actor whose turn or other information is used to trigger an expiration?",
            }),
          }),
          what: builders.combatExpirationMethodField(),
          when: builders.combatExpirationTimingField(),
        }),
      }),
      sourceDescription: new fields.HTMLField(),
      heightened: new fields.NumberField(),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrateHierarchy(data);
    return super.migrateData(data);
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

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = this.parent.remainingString;
    return parts;
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
  get messageBlocks() {
    return this.blocks;
  }

  /**
   * Checks if the effect expires on movement.
   * @returns {boolean} True if the effect expires on movement, false otherwise.
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /** @inheritDoc */
  get nameString() {
    let ns = super.nameString;
    if (this.critical) {
      ns += " (Critical)";
    }
    return ns;
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.bars = [
      {
        icon: "fa-hourglass",
        label: "Duration",
        wrappers: [this.parent.remainingString],
      },
      {
        icon: "fa-disease",
        label: "Conditions",
        wrappers: [
          ...Array.from(
            this.parent.statuses.map(
              (status) => TERIOCK.index.conditions[status],
            ),
          ),
          this.critical ? "Critical" : "",
          this.heightened
            ? `Heightened ${this.heightened} Time${
                this.heightened === 1 ? "" : "s"
              }`
            : "",
        ],
      },
    ];
    parts.associations.push(...this.associations);
    return parts;
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

  /** @inheritDoc */
  async _use(_options = {}) {
    await this.inCombatExpiration(true);
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
  async shouldExpire() {
    let should = await super.shouldExpire();
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
      /** @type {TeriockEffect} */
      const source = await fromUuid(this.source);
      should = should || !source || !source.active;
    }
    return should;
  }
}
