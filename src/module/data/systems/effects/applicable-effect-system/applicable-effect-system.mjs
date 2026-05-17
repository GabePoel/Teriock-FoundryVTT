import { inCombatExpirationDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockActiveEffect } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { builders } from "../../../fields/helpers/_module.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";
import DurationModel from "../../../models/unit-models/duration-model.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { ThresholdDataMixin } from "../../../shared/mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ApplicableEffectSystemData}
 */
export default class ApplicableEffectSystem extends mixClasses(BaseEffectSystem, ThresholdDataMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Applicable"];

  /** @inheritDoc */
  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.AbilityMacroAutomation,
      automations.ChangeCompetenceAutomation,
      automations.ChangesAutomation,
      automations.ChildChangeAutomation,
      automations.HealAutomation,
      automations.ProtectionAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability", "fluency", "property", "resource"],
      childItemTypes: [],
      usable: true,
      visibleTypes: ["ability", "fluency", "property", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      blocks: builders.blocksField(),
      critical: new fields.BooleanField(),
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
        sustained: new fields.BooleanField(),
        triggers: new fields.SetField(new fields.StringField({ choices: DurationModel._triggerChoices })),
      }),
      heightened: new fields.NumberField(),
    });
  }

  /** @inheritDoc */
  get _nameTags() {
    const tags = super._nameTags;
    if (this.critical) {
      tags.unshift(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical"));
    }
    return tags;
  }

  /** @returns {Teriock.Sheet.DisplayField[]} */
  get displayFields() {
    return ["description"];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      subtitle: this.parent.remainingString,
    });
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
    return [...super.messageBlocks, this.blocks];
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.SYSTEMS.Condition.USAGE.use", {
      value: this.parent.name,
    });
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor) {
      this.parent.fireTrigger("applyEffect", this.parent.getScope());
    }
  }

  /** @inheritDoc */
  _onFireTrigger(trigger) {
    super._onFireTrigger(trigger);
    if (this.expirations.triggers.has(trigger)) this.expire();
  }

  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    if (this.parent.parent) {
      const start = TeriockActiveEffect.getEffectStart();
      for (const key of Object.keys(start)) {
        if (data.start?.[key] !== undefined) delete start[key];
      }
      this.parent.updateSource({ start });
    }
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    const yes = await super._preDelete(options, user);
    if (yes === false) return false;

    this.parent.fireTrigger("expireEffect", this.parent.getScope());
  }

  /** @inheritDoc */
  async _use(_options = {}) {
    await this.inCombatExpiration(true);
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars = [
      {
        icon: TERIOCK.display.icons.ability.duration,
        label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.duration"),
        wrappers: [this.parent.remainingString],
      },
      {
        icon: TERIOCK.display.icons.document.condition,
        label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.conditions"),
        wrappers: [
          ...Array.from(this.parent.statuses.map(status => TERIOCK.reference.conditions[status])),
          this.critical ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical") : "",
          this.heightened
            ? this.heightened === 1
              ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")
              : _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", {
                  value: this.heightened,
                })
            : "",
        ],
      },
    ];
    return parts;
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
    return super.shouldExpire();
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
