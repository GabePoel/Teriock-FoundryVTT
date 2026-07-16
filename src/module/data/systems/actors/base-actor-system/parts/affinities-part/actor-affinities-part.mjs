import affinityConfig from "../../../../../../constants/config/affinity-config.mjs";
import { ThresholdRoll } from "../../../../../../dice/rolls/_module.mjs";
import { AffinityExecution, ResistanceExecution } from "../../../../../../executions/activity-executions/_module.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { parseIdentifier } from "../../../../../../helpers/utils.mjs";
import { FakeAffinityModel } from "../../../../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Every affinity type that stops or lessens something, and so counts as a protection.
 * @type {Teriock.Affinities.Type[]}
 */
const PROTECTION_TYPES = Object.entries(affinityConfig.types).filter(([, t]) => t.protection).map(([k]) => k);

/**
 * The default display order for affinity types, taken from {@link affinityConfig}'s `groups`.
 * @type {Teriock.Affinities.Type[]}
 */
const TYPE_ORDER = Object.values(affinityConfig.groups).flatMap(group => group.types);

/**
 * Actor data model that handles affinities.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorAffinitiesPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorAffinitiesPartData}
     * @mixin
     */
    class ActorAffinitiesPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          derivedAffinities: new fields.TypedObjectField(new fields.EmbeddedDataField(FakeAffinityModel), {
            persisted: false,
          }),
        });
      }

      /**
       * Record a single affinity, consolidating it with any matching affinity already recorded. Stacking affinities add
       * their amounts together; everything else keeps the highest competence available. Every source that grants it is
       * remembered so the actor can show where it came from.
       * @param {Teriock.Affinities.EntryData} entry
       */
      #addAffinity(entry) {
        const id = FakeAffinityModel.affinityId(entry.type, entry.category, entry.value);
        const existing = this.derivedAffinities[id];
        if (!existing) {
          this.derivedAffinities[id] = new FakeAffinityModel(entry, { parent: this });
          return;
        }
        existing.amount += entry.amount;
        for (const provider of entry.providers ?? []) { existing.providers.add(provider); }
        if (entry.competence > existing.competence) {
          existing.competence = entry.competence;
          existing.img = entry.img;
        }
      }

      /**
       * Add an affinity granted by a condition the actor has, crediting that condition as its provider.
       * @param {Teriock.Keys.Condition} condition
       * @param {Teriock.Affinities.Type} type
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       */
      #addConditionAffinity(condition, type, category, value) {
        if (!this.parent.statuses.has(condition)) { return; }
        this.addVirtualAffinity(type, category, value, TERIOCK.reference.conditions[condition]);
      }

      /**
       * Every affinity this actor has, in a stable order.
       * @returns {FakeAffinityModel[]}
       */
      get affinityEntries() {
        return Object.values(this.derivedAffinities).sort((a, b) =>
          (TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)) || a.category.localeCompare(b.category)
          || a.value.localeCompare(b.value)
        );
      }

      /**
       * Add an affinity that comes from something other than a {@link BaseAffinity}, such as a condition.
       * @param {Teriock.Affinities.Type} type
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       * @param {string} provider - What gives this affinity to the actor.
       * @param {number} [amount]
       */
      addVirtualAffinity(type, category, value, provider, amount = 0) {
        const config = affinityConfig.types[type] || {};
        const fallback = getImage(config.imgCategory, parseIdentifier(config.identifier).identifier);
        this.#addAffinity({
          amount,
          category,
          competence: 2,
          img: getImage(affinityConfig.categories[category]?.imgCategory, value, fallback),
          providers: [provider].filter(Boolean),
          type,
          value,
        });
      }

      /**
       * The amount recorded for a specific affinity.
       * @param {Teriock.Affinities.Type} type
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       * @returns {number}
       */
      affinityAmount(type, category, value) {
        return this.getAffinity(type, category, value)?.amount ?? 0;
      }

      /**
       * Get a specific affinity, if this actor has it.
       * @param {Teriock.Affinities.Type} type
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       * @returns {FakeAffinityModel | undefined}
       */
      getAffinity(type, category, value) {
        return this.derivedAffinities[FakeAffinityModel.affinityId(type, category, value)];
      }

      /**
       * Checks whether this actor has a given affinity.
       * @param {Teriock.Affinities.Type} type
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       * @returns {boolean}
       */
      hasAffinity(type, category, value) {
        return Boolean(this.getAffinity(type, category, value));
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
       */
      isProtected(category, value) {
        return PROTECTION_TYPES.some(type => this.hasAffinity(type, category, value));
      }

      /**
       * Gather every affinity granted by this actor's active effects. Amounts are summed, so this clears anything it
       * previously recorded.
       */
      prepareAffinities() {
        for (const id of Object.keys(this.derivedAffinities)) { delete this.derivedAffinities[id]; }
        const effects = this.parent.validEffects.filter(e => e.active);
        for (const effect of effects) {
          for (const affinity of effect.system.activeAffinities ?? []) { this.#addAffinity(affinity.toEntry()); }
        }
      }

      /**
       * Gather every affinity granted by this actor's active effects. Runs before {@link prepareVirtualEffects} so that
       * virtual affinities stack onto real ones, and so that anything checking {@link isProtected} while resolving
       * virtual effects sees a complete picture.
       * @inheritDoc
       */
      prepareCleanupData() {
        this.prepareAffinities();
        super.prepareCleanupData();
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        super.prepareVirtualEffects();
        this.#addConditionAffinity("hollied", "resistance", "effectTypes", "reanimation");
        this.#addConditionAffinity("terrored", "resistance", "effectTypes", "healing");
        this.#addConditionAffinity("terrored", "resistance", "effectTypes", "revival");
        this.#addConditionAffinity("frenzied", "resistance", "statuses", "frightened");
        this.#addConditionAffinity("defyingDeath", "resistance", "statuses", "dead");
        this.#addConditionAffinity("defyingDeath", "resistance", "statuses", "unconscious");
        this.#addConditionAffinity("allured", "binding", "statuses", "allured");
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
       * @param {Teriock.Affinities.Type} type - The type of affinity to roll.
       * @param {Partial<Teriock.Execution.AffinityExecutionOptions>} [options] - Options for the roll.
       * @returns {Promise<void>}
       */
      async rollAffinity(type, options = {}) {
        const config = affinityConfig.types[type];
        if (!config) { return; }
        if (options.event) { Object.assign(options, ThresholdRoll.parseEvent(options.event)); }
        if (config.hook) { await this.parent.hookCall(config.hook); }
        const Execution = config.threshold ? ResistanceExecution : AffinityExecution;
        await Execution.create({}, Object.assign(options, { actor: this.parent, type }));
      }

      /**
       * How many boosts this actor takes against something. Deboosts are stored separately and subtract from boosts, so
       * a negative result means the actor is deboosted against it on balance.
       *
       * Relevant wiki pages:
       * - [Boosted](https://wiki.teriock.com/index.php/Keyword:Boosted)
       * - [Deboosted](https://wiki.teriock.com/index.php/Keyword:Deboosted)
       *
       * @param {Teriock.Keys.AffinityCategory} category
       * @param {string} value
       * @returns {number}
       * @todo Find a way to use this on chat messages that isn't insane
       */
      takeBoostsAgainst(category, value) {
        return this.affinityAmount("takeBoost", category, value) - this.affinityAmount("takeDeboost", category, value);
      }
    }
  );
}
