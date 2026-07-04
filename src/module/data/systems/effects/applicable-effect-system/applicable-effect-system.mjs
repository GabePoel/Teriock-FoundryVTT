import { TeriockActiveEffect } from "../../../../documents/_module.mjs";
import { ExpirationExecution } from "../../../../executions/child-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { dedent } from "../../../../helpers/string.mjs";
import { builders } from "../../../fields/tools/_module.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as expirations from "../../../pseudo-documents/expirations/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ApplicableEffectSystemData}
 * @mixes ExpirableSystem
 * @mixes ThresholdData
 * @see {DurationModel}
 */
export default class ApplicableEffectSystem
  extends mixClasses(BaseEffectSystem, systemMixins.ExpirableSystemMixin, dataMixins.ThresholdDataMixin)
{
  /** @inheritDoc */
  static Execution = ExpirationExecution;

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
      automations.LightAutomation,
      automations.ProtectionAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
      automations.SuppressAutomation,
      automations.TakeAutomation,
    ];
  }

  /** @inheritDoc */
  static get _expirationTypes() {
    return [
      ...super._expirationTypes,
      expirations.TriggerExpiration,
      expirations.CombatExpiration,
      expirations.StatusExpiration,
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
      executor: new fields.DocumentUUIDField({ nullable: true, type: "Actor" }),
      heightened: new fields.NumberField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    if (typeof source.expirations === "object") {
      for (const k of Object.keys(source.expirations)) {
        if (k.length !== 16) { delete source.expirations[k]; }
      }
    }
    return super.migrateData(source, options, state);
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

    if (CONFIG.ActiveEffect.expiryAction === "delete") {
      this.parent.fireTrigger("expireEffect", this.parent.getScope());
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (
      CONFIG.ActiveEffect.expiryAction === "update" && foundry.utils.getProperty(changes, "duration.expired") === true
    ) { this.parent.fireTrigger("expireEffect", this.parent.getScope()); }
  }

  /** @inheritDoc */
  async _use(options = {}) {
    await super._use(
      Object.assign(options, {
        actor: this.actor,
        expiration: this.activeExpirations.find((e) => e.method === "roll"),
        source: this.parent,
      }),
    );
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    // We can't override the `isTemporary` getter since that messes with Foundry's ActiveEffectRegistry.
    if (this.parent._source.showIcon === CONST.ACTIVE_EFFECT_SHOW_ICON.CONDITIONAL && this.expirations.size) {
      this.parent.showIcon = CONST.ACTIVE_EFFECT_SHOW_ICON.ALWAYS;
    }
    // Having a description that matches the structure of our panels helps these get along better with modules.
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
}
