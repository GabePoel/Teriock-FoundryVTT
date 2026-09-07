import statConfig from "../../../../constants/config/stat-config.mjs";
import { BaseAffinity } from "../../../../data/pseudo-documents/affinities/abstract/_module.mjs";
import { BaseExpiration } from "../../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityExecutionChat>}
 */
export default function AbilityExecutionChatPart(Base) {
  /** @mixin */
  class AbilityExecutionChat extends Base {
    /**
     * Get the default effect duration.
     * @returns {Promise<undefined|number>}
     */
    async #getDuration() {
      const durationFormula = this.source.system.duration.formula;
      const durationValue = await BaseRoll.getValue(durationFormula, this.getRollData());
      return durationValue >= TERIOCK.config.system.inf / 10 ? undefined : durationValue;
    }

    /** @inheritDoc */
    async _buildActivations() {
      const acts = teriock.data.pseudoDocuments.activations;

      // Add feat save activation
      if (this.isFeat && !this.preventFeat) {
        const featOptions = { attribute: this.source.system.featSaveAttribute };
        if (!this.preventThreshold) { featOptions.threshold = this.rolls[0].total; }
        this.activations.push(new acts.FeatActivation({ options: featOptions }));
      }

      // Add block cone activation
      if (this.source.system.delivery === "cone" && !this.preventBlockCone) {
        this.activations.push(new acts.UseLocalActivation({ options: { lookup: "ability:block-cone" } }));
      }

      // Add all pre-defined activations
      if (await super._buildActivations() === false) { return false; }
    }

    /** @inheritDoc */
    async _buildSourcePanel() {
      const panel = await super._buildSourcePanel();
      if (!panel) { return panel; }
      const blockStates = {
        "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label": this.heightened,
        "TERIOCK.SYSTEMS.Ability.FIELDS.overview.fluent.label": this.competence.fluent,
        "TERIOCK.SYSTEMS.Ability.FIELDS.overview.proficient.label": this.competence.proficient,
      };
      for (const [labelKey, active] of Object.entries(blockStates)) {
        const block = panel.blocks.find(b => b.title === _loc(labelKey));
        if (!block) { continue; }
        if (active) { delete block.classes; }
        else { block.classes = [TERIOCK.display.panels.styles.faded]; }
      }
      return panel;
    }

    /** @inheritDoc */
    async _buildTags() {
      await super._buildTags();
      if (this.heightened > 0) {
        if (this.heightened === 1) { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")); }
        else { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened })); }
      }
      for (const c of Object.keys(this.costs).filter(c => this.costs[c] > 0)) {
        this.tags.push(
          _loc("TERIOCK.SYSTEMS.Applicable.PANELS.spent", {
            amount: this.costs[c],
            label: statConfig[c]?.abbreviation,
          }),
        );
      }
      this._buildBoostTags();
    }

    /** @inheritDoc */
    async _getCriticalEffectData() {
      const data = await this._getNormalEffectData();
      data.system.affinities = BaseAffinity.toCollectionObject(
        this.affinities.active.filter(a => a.crit.has(1)).map(a => a.toObject()),
      );
      data.system.critical = true;
      data.system.expirations = BaseExpiration.toCollectionObject(
        this.expirations.active.filter(e => e.crit.has(1)).map(e => e.toObject()),
      );
      return data;
    }

    /** @inheritDoc */
    _getEffectTypeData(type) {
      const data = super._getEffectTypeData(type);
      data.children = type === "consequence" ? this.source.subs.map(s => s.toObject()) : [];
      if (type === "consequence") { data.showIcon = 1; }
      return data;
    }

    /** @inheritDoc */
    async _getNormalEffectData() {
      return {
        changes: [],
        duration: { expiry: null, seconds: await this.#getDuration() },
        img: this.source.img,
        name: _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", { name: this.source.name }),
        origin: this.source.uuid,
        showIcon: 0,
        system: {
          _src: this.source.uuid,
          affinities: BaseAffinity.toCollectionObject(
            this.affinities.active.filter(a => a.crit.has(0)).map(a => a.toObject()),
          ),
          applyIfDeattuned: true,
          blocks: (await this.source.system.getPanelParts()).blocks,
          competence: { raw: this.competence.value },
          effectTypes: Array.from(this.source.system.effectTypes),
          elements: Array.from(this.source.system.elements),
          executor: this.actor?.uuid ?? null,
          expirations: BaseExpiration.toCollectionObject(
            this.expirations.active.filter(e => e.crit.has(0)).map(e => e.toObject()),
          ),
          heightened: this.heightened,
          identifier: `${this.source.forcedIdentifier}-effect`,
          powerSources: Array.from(this.source.system.powerSources),
          sustained: this.source.system.sustained,
        },
      };
    }
  }

  return AbilityExecutionChat;
}
