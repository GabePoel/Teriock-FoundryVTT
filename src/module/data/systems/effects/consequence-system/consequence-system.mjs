import { inCombatExpirationDialog } from "../../../../applications/dialogs/_module.mjs";
import { getRollIcon, mix } from "../../../../helpers/utils.mjs";
import { builders } from "../../../fields/helpers/_module.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
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

  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.AbilityMacroAutomation,
      automations.ChangesAutomation,
      automations.HealAutomation,
      automations.ProtectionAutomation,
      automations.RevitalizeAutomation,
    ];
  }

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
        conditions: conditionRequirementsField(),
        description: new fields.StringField(),
        sustained: new fields.BooleanField({ initial: false }),
        triggers: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.system.pseudoHooks.all }),
        ),
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
              (status) => TERIOCK.reference.conditions[status],
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
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor) {
      this.parent.hookCall("effectApplication").then();
    }
  }

  /** @inheritDoc */
  _onFireTrigger(trigger) {
    super._onFireTrigger(trigger);
    if (this.expirations.triggers.has(trigger)) {
      this.expire().then();
    }
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    if ((await super._preDelete(options, user)) === false) {
      return false;
    }
    await this.parent.hookCall("effectExpiration");
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
    if (this.shouldExpireFromConditions()) return true;
    if (await this.shouldExpireFromBeingUnsustained()) return true;
    return super.shouldExpire();
  }

  /**
   * Checks if this should expire due to being unsustained.
   * @returns {Promise<boolean>}
   */
  async shouldExpireFromBeingUnsustained() {
    if (!this.expirations.sustained) return false;
    if (
      !game.settings.get("teriock", "automaticallyExpireSustainedConsequences")
    ) {
      return false;
    }
    const source = await fromUuid(this.source);
    return source && !source.active;
  }

  /**
   * Checks if this should expire due to its actor's conditions.
   * @returns {boolean}
   */
  shouldExpireFromConditions() {
    if (!this.actor) return false;
    for (const c of this.expirations.conditions.present) {
      if (!this.actor.statuses.has(c)) return true;
    }
    for (const c of this.expirations.conditions.absent) {
      if (this.actor.statuses.has(c)) return true;
    }
    return false;
  }
}
