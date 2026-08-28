import affinityConfig from "../../../../../constants/config/affinity-config.mjs";
import { ThresholdRoll } from "../../../../../dice/rolls/_module.mjs";
import { AffinityExecution, ResistanceExecution } from "../../../../../executions/activity-executions/_module.mjs";
import { toId } from "../../../../../helpers/string.mjs";
import { BaseAffinity } from "../../../../pseudo-documents/affinities/abstract/_module.mjs";

/**
 * Cache of the Affinity types that are "no effect" protections in the [FanWar](https://fanwar.com) context.
 * @type {AffinityType[]}
 */
const PROTECTION_TYPES = Object.entries(affinityConfig.types).filter(([, t]) => t.protection).map(([k]) => k);

/**
 * Cached record of Affinity types.
 * @type {AffinityTypeMap}
 * @todo Remove this when Pseudo-Documents get moved to `CONFIG`-style structure.
 */
const AFFINITY_TYPES = {};

/**
 * Actor data model that handles affinities.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorAffinitiesPart>}
 */
export default function ActorAffinitiesPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorAffinitiesPart extends Base {
    /**
     * Add a virtual affinity.
     * @param {AffinityType} type
     * @param {Teriock.Keys.AffinityCategory} category
     * @param {string} value
     * @param {string} source
     * @param {object} data
     */
    _addVirtualAffinity(type, category, value, source, data) {
      const id = toId(`${type}${category}${value}${source}`, { hash: true });
      if (!AFFINITY_TYPES[type]) {
        AFFINITY_TYPES[type] = Object.values(teriock.data.pseudoDocuments.affinities).filter(a =>
          foundry.utils.isSubclass(a, BaseAffinity)
        ).find(a => a.TYPE === type);
      }
      const affinity = new AFFINITY_TYPES[type]({ _id: id, category, type, value, ...data }, { parent: this });
      affinity.sourceName = source;
      this.affinities.set(affinity.id, affinity);
    }

    /**
     * Add a virtual affinity for a condition.
     * @param {Teriock.Keys.Condition} status
     * @param {AffinityType} type
     * @param {Teriock.Keys.AffinityCategory} category
     * @param {string} value
     * @param {object} data
     */
    _addVirtualConditionAffinity(status, type, category, value, data) {
      if (!this.parent.statuses.has(status)) { return; }
      this._addVirtualAffinity(type, category, value, TERIOCK.statuses.conditions[status]?.name, {
        img: TERIOCK.statuses.conditions[status]?.img,
        ...data,
      });
    }

    /**
     * Checks if there's some protection against something. Only affinities that stop or lessen something count.
     *
     * Relevant wiki pages:
     * - [Protection keywords](https://wiki.teriock.com/index.php/Category:Protection_keywords)
     *
     * @param {Teriock.Keys.AffinityCategory} category - Category of protection
     * @param {string} value - Specific protection
     * @returns {boolean} Whether or not there's some protection against the specified key and value
     * @todo Test this
     */
    isProtected(category, value) {
      return PROTECTION_TYPES.flatMap(type => this.affinities.getTypeSync(type, { active: true, ongoing: true })).some(
        a => a.category === category && a.value === value
      );
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      super.prepareVirtualEffects();
      this._addVirtualConditionAffinity("hollied", "resistance", "effectTypes", "reanimation");
      this._addVirtualConditionAffinity("terrored", "resistance", "effectTypes", "healing");
      this._addVirtualConditionAffinity("terrored", "resistance", "effectTypes", "revival");
      this._addVirtualConditionAffinity("frenzied", "resistance", "conditions", "frightened");
      this._addVirtualConditionAffinity("defyingDeath", "resistance", "conditions", "dead");
      this._addVirtualConditionAffinity("defyingDeath", "resistance", "conditions", "unconscious");
      this._addVirtualConditionAffinity("allured", "binding", "conditions", "allured");
      this._addVirtualConditionAffinity("burned", "incapability", "other", _loc("TERIOCK.AFFINITIES.Condition.burned"));
      this._addVirtualConditionAffinity(
        "silenced",
        "incapability",
        "other",
        _loc("TERIOCK.AFFINITIES.Condition.silenced"),
      );
      this._addVirtualConditionAffinity(
        "frenzied",
        "ineptitude",
        "other",
        _loc("TERIOCK.AFFINITIES.Condition.frenzied"),
      );
    }

    /**
     * Rolls one of this actor's affinities. Affinities that are rolled against a threshold go through a
     * {@link ResistanceExecution}.
     *
     * Relevant wiki pages:
     * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
     * - [Hexproof](https://wiki.teriock.com/index.php/Keyword:Hexproof)
     * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
     * - [Hexseal](https://wiki.teriock.com/index.php/Keyword:Hexseal)
     *
     * @param {AffinityType} type - The type of affinity to roll.
     * @param {Partial<Teriock.Execution.AffinityExecutionOptions>} [options] - Options for the roll.
     * @returns {Promise<void>}
     * @todo Rework to work with {@link BaseAffinity}.
     */
    async rollAffinity(type, options = {}) {
      const config = affinityConfig.types[type];
      if (!config) { return; }
      if (options.event) { Object.assign(options, ThresholdRoll.parseEvent(options.event)); }
      if (config.hook) { await this.parent.hookCall(config.hook); }
      const Execution = config.threshold ? ResistanceExecution : AffinityExecution;
      await Execution.create({}, Object.assign(options, { actor: this.parent, type }));
    }
  }

  return ActorAffinitiesPart;
}
