import { inCombatExpirationDialog } from "../../../../applications/dialogs/_module.mjs";
import { getRollIcon, mix } from "../../../../helpers/utils.mjs";
import { builders } from "../../../fields/helpers/_module.mjs";
import { migrateHierarchy } from "../../../shared/migrations/migrate-hierarchy.mjs";
import { ThresholdDataMixin } from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @implements {Teriock.Models.ConsequenceSystemInterface}
 * @mixes HierarchySystem
 * @mixes TransformationSystem
 */
export default class ConsequenceSystem extends mix(
  BaseEffectSystem,
  mixins.HierarchySystemMixin,
  mixins.TransformationSystemMixin,
  ThresholdDataMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Consequence",
  ];

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
      impacts: new fields.SchemaField({
        changes: new fields.ArrayField(builders.qualifiedChangeField()),
      }),
      expirations: new fields.SchemaField({
        conditions: new fields.SchemaField({
          present: new fields.SetField(
            new fields.StringField({ choices: TERIOCK.index.conditions }),
          ),
          absent: new fields.SetField(
            new fields.StringField({ choices: TERIOCK.index.conditions }),
          ),
        }),
        movement: new fields.BooleanField({ initial: false }),
        dawn: new fields.BooleanField({ initial: false }),
        sustained: new fields.BooleanField({ initial: false }),
        description: new fields.StringField(),
        combat: new fields.SchemaField({
          who: new fields.SchemaField({
            type: builders.combatExpirationSourceTypeField(),
            source: new fields.DocumentUUIDField({
              type: "Actor",
              nullable: true,
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

  /** @inheritDoc */
  get changes() {
    return this.impacts.changes;
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
      ns += ` (${game.i18n.localize("TERIOCK.SYSTEMS.Consequence.PANELS.critical")})`;
    }
    return ns;
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.bars = [
      {
        icon: TERIOCK.display.icons.ability.duration,
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.Consequence.PANELS.duration",
        ),
        wrappers: [this.parent.remainingString],
      },
      {
        icon: TERIOCK.display.icons.document.condition,
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.Consequence.PANELS.conditions",
        ),
        wrappers: [
          ...Array.from(
            this.parent.statuses.map(
              (status) => TERIOCK.index.conditions[status],
            ),
          ),
          this.critical
            ? game.i18n.localize("TERIOCK.SYSTEMS.Consequence.PANELS.critical")
            : "",
          this.heightened
            ? this.heightened === 1
              ? game.i18n.localize(
                  "TERIOCK.SYSTEMS.Consequence.PANELS.heightenedSingle",
                )
              : game.i18n.format(
                  "TERIOCK.SYSTEMS.Consequence.PANELS.heightenedPlural",
                  { value: this.heightened },
                )
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
    return game.i18n.format("TERIOCK.SYSTEMS.Condition.USAGE.use", {
      value: this.parent.name,
    });
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
      const source = await fromUuid(this.source);
      should = should || !source || !source.active;
    }
    return should;
  }
}
