import { TeriockActiveEffect } from "../../../../../documents/_module.mjs";
import { dedent, mergeMetadata, mixClasses, toClass } from "../../../../../utils/_module.mjs";
import { ThresholdDataMixin } from "../../../../mixins/_module.mjs";
import { StatusAutomation } from "../../../../pseudo-documents/automations/_module.mjs";
import { AffinableSystemMixin, ExpirableSystemMixin, MetaphysicsSystemMixin } from "../../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

/**
 * Effect-specific effect data model.
 * @extends {BaseEffectSystem}
 * @mixes AffinableSystem
 * @mixes ExpirableSystem
 * @mixes MetaphysicsSystem
 * @mixes ThresholdData
 * @see {AbilityDurationUnitModel}
 */
export default class ApplicableEffectSystem
  extends mixClasses(
    BaseEffectSystem,
    AffinableSystemMixin,
    ExpirableSystemMixin,
    MetaphysicsSystemMixin,
    ThresholdDataMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Applicable"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    automationTags: { dependents: true, passive: true, triggered: true },
    childTypes: ["ability", "fluency", "property", "resource"],
    tags: { applicable: true, usable: true },
    visibleTypes: ["ability", "fluency", "property", "resource"],
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.child.ExpirationExecution;
  }

  /**
   * A message bar with duration information.
   * @returns {Teriock.Panels.PanelBar}
   */
  get _durationBar() {
    return {
      icon: TERIOCK.DISPLAY.icons.manifest.ability.duration,
      label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.duration"),
      wrappers: [this.parent.remainingString],
    };
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["kind", ...super._formPaths];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._durationBar, this._metaphysicsBar, this._statusBar];
  }

  /**
   * A message bar with status information.
   * @returns {Teriock.Panels.PanelBar}
   */
  get _statusBar() {
    return {
      icon: teriock.data.systems.effects.ConditionSystem.metadata.icon,
      label: _loc("TERIOCK.SYSTEMS.Applicable.PANELS.conditions"),
      wrappers: Array.from(this.parent.statuses.map(status => CONFIG.statusEffects[status]?.name)),
    };
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: this.parent.remainingString });
  }

  /** @inheritDoc */
  get isPassive() {
    return true;
  }

  /** @inheritDoc */
  get makesChatData() {
    return false;
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.SYSTEMS.Condition.USAGE.use", { value: this.parent.name });
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    if (this.parent.checkEditor(userId) && this.actor) { this.parent.fireTrigger("applyEffect"); }
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    // Ensure duration is always set properly.
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
      this.parent.fireTrigger("expireEffect");
    }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (
      CONFIG.ActiveEffect.expiryAction === "update" && foundry.utils.getProperty(changes, "duration.expired") === true
    ) { this.parent.fireTrigger("expireEffect"); }
  }

  /** @inheritDoc */
  async _use(data = {}, options = {}) {
    return super._use(
      data,
      Object.assign(options, {
        actor: this.actor,
        expiration: this.expirations.active.find((e) => e.method === "roll"),
        source: this.parent,
      }),
    );
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    for (const a of this.automations.getTypeSync(StatusAutomation.metadata.type, { active: true })) {
      if (a.relation === "include") { this.parent.statuses.add(a.status); }
    }
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
      const extraClasses = toClass(block.classes);
      return `${acc}
      <div class="teriock-panel-block${extraClasses ? ` ${extraClasses}` : ""}">
        <div class="teriock-panel-block-title">${safeTitle}</div>
        <div class="teriock-panel-block-text">${block.text}</div>
      </div>`;
    }, "");
    if (blocksHTML) {
      this.parent.description = dedent(`
      <div class="teriock-panel teriock-panel-no-background teriock-description-panel">
        <div class="teriock-panel-body">${blocksHTML}</div>
      </div>`).trim();
    }
  }
}
