import { TeriockActiveEffect } from "../../../../documents/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dedent } from "../../../../helpers/string.mjs";
import { builders } from "../../../fields/helpers/_module.mjs";
import { conditionRequirementsField } from "../../../fields/helpers/builders.mjs";
import DurationModel from "../../../models/unit-models/duration-model.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as dataMixins from "../../../shared/mixins/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ApplicableEffectSystemData}
 * @mixes CombatExpirableSystem
 * @mixes ThresholdData
 * @see {DurationModel}
 */
export default class ApplicableEffectSystem
  extends mixClasses(BaseEffectSystem, systemMixins.CombatExpirableSystemMixin, dataMixins.ThresholdDataMixin)
{
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
      automations.SuppressAutomation,
      automations.TakeAutomation,
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
          what: builders.combatExpirationMethodField(),
          when: builders.combatExpirationTimingField(),
          who: new fields.SchemaField({
            source: new fields.DocumentUUIDField({ nullable: true, type: "Actor" }),
            type: builders.combatExpirationSourceTypeField(),
          }),
        }),
        conditions: conditionRequirementsField(),
        description: new fields.StringField(),
        sustained: new fields.BooleanField(),
        triggers: new fields.SetField(new fields.StringField({ choices: DurationModel.triggerChoices })),
      }),
      heightened: new fields.NumberField(),
    });
  }

  /** @inheritDoc */
  get _displayFields() {
    return ["description"];
  }

  /**
   * A message bar with duration information.
   * @returns {Teriock.Panels.PanelBar}
   */
  get _durationBar() {
    return {
      icon: TERIOCK.display.icons.ability.duration,
      label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.duration"),
      wrappers: [this.parent.remainingString],
    };
  }

  /** @inheritDoc */
  get _nameTags() {
    const tags = super._nameTags;
    if (this.critical) { tags.unshift(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical")); }
    return tags;
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._durationBar, this._statusBar];
  }

  /** @inheritDoc */
  get _panelBlocks() {
    if (this.parent._source.description) { return super._panelBlocks; }
    return this.blocks;
  }

  /**
   * A message bar with status information.
   * @returns {Teriock.Panels.PanelBar}
   */
  get _statusBar() {
    return {
      icon: TERIOCK.display.icons.document.condition,
      label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.conditions"),
      wrappers: [
        ...Array.from(this.parent.statuses.map(status => TERIOCK.reference.conditions[status])),
        this.critical ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.critical") : "",
        this.heightened
          ? this.heightened === 1
            ? _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")
            : _loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened })
          : "",
      ],
    };
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: this.parent.remainingString });
  }

  /** @inheritDoc */
  get isTemporary() {
    return super.isTemporary || this.expirations.combat.what.type !== "none" || Boolean(this.expirations.triggers.size)
      || Boolean(this.expirations.description) || Boolean(this.expirations.conditions.absent.size)
      || Boolean(this.expirations.conditions.present.size);
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
  get useText() {
    return _loc("TERIOCK.SYSTEMS.Condition.USAGE.use", { value: this.parent.name });
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor) { this.parent.fireTrigger(
        "applyEffect",
        this.parent.getScope(),
      ); }
  }

  /** @inheritDoc */
  _onFireTrigger(trigger) {
    super._onFireTrigger(trigger);
    if (this.expirations.triggers.has(trigger)) { this.expire(); }
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (this.parent.parent) {
      const start = TeriockActiveEffect.getEffectStart();
      for (const key of Object.keys(start)) { if (data.start?.[key] !== undefined) { delete start[key]; } }
      this.parent.updateSource({ start });
    }
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    const yes = await super._preDelete(options, user);
    if (yes === false) { return false; }

    this.parent.fireTrigger("expireEffect", this.parent.getScope());
  }

  /** @inheritDoc */
  async _use(_options = {}) {
    await this.inCombatExpiration(true);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const blocks = this._panelBlocks;
    if (this.parent._source.description || !blocks?.length) { return; }
    const blocksHTML = blocks.reduce((acc, block) => {
      if (!block.text) { return acc; }
      const safeTitle = foundry.utils.escapeHTML(block.title || "");
      const extraClasses = block.classes ? ` ${block.classes}` : "";
      return `${acc}
      <div class="teriock-panel-block${extraClasses}">
        <div class="teriock-panel-block-title">${safeTitle}</div>
        <div class="teriock-panel-block-text">${block.text}</div>
      </div>`;
    }, "");
    if (blocksHTML) {
      this.parent.description = dedent(`
      <div class="teriock-panel teriock-description-panel">
        <div class="teriock-panel-body">${blocksHTML}</div>
      </div>`).trim();
    }
  }

  /** @inheritDoc */
  async shouldExpire() {
    if (this.shouldExpireFromConditions()) { return true; }
    return super.shouldExpire();
  }

  /**
   * Checks if this should expire due to its actor's conditions.
   * @returns {boolean}
   */
  shouldExpireFromConditions() {
    if (!this.actor) { return false; }
    for (const c of this.expirations.conditions.present) { if (!this.actor.statuses.has(c)) { return true; } }
    for (const c of this.expirations.conditions.absent) { if (this.actor.statuses.has(c)) { return true; } }
    return false;
  }
}
