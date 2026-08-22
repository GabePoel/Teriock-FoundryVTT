import { toKebabCase } from "../../../../../../helpers/string.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { PseudoCollectionField } from "../../../../../fields/_module.mjs";
import { VirtualCondition } from "../../../../../pseudo-documents/_module.mjs";
import { StatusExpiration } from "../../../../../pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../../../../pseudo-documents/expirations/abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles conditions.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorConditionsPart & Teriock.Models.ActorConditionsPartData>}
 */
export default function ActorConditionsPart(Base) {
  /**
   * @implements {Teriock.Models.ActorConditionsPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorConditionsPart extends Base {
    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { VirtualCondition: "system.virtualConditions" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        conditionInformation: new fields.SchemaField(
          objectMap(TERIOCK.index.conditions, () => {
            return new fields.SchemaField({
              locked: new fields.BooleanField(),
              reasons: new fields.SetField(new fields.StringField()),
              sources: new fields.SetField(new fields.DocumentUUIDField()),
              trackers: new fields.SetField(new fields.DocumentUUIDField()),
            });
          }),
          { persisted: false },
        ),
        virtualConditions: new PseudoCollectionField(VirtualCondition),
      });
    }

    /**
     * Copy active effect names into condition information.
     */
    #applyEffectConditionReasons() {
      for (const e of this.parent.appliedEffects) {
        this._addVirtualConditions(Array.from(e.statuses), e);
      }
    }

    /**
     * Prepare condition information now that all virtual statuses have been applied.
     */
    #cleanConditionInformation() {
      for (const part of ["arm", "leg"]) {
        const str = `TERIOCK.STATUSES.Hacks.${part}Hack`;
        if (this.conditionInformation.hacked.reasons.has(_loc(`${str}2`))) {
          this.conditionInformation.hacked.reasons.delete(_loc(`${str}1`));
        }
      }
      for (const info of Object.values(this.conditionInformation)) {
        if (info.reasons.size > 0) { info.locked = true; }
      }
    }

    /**
     * The statuses that were added or removed since the last time this was called, tracking the previous set on
     * the actor's cache so status expirations only get checked against the statuses that actually changed.
     * @returns {Set<Teriock.Keys.Condition>}
     */
    #consumeChangedStatuses() {
      const statuses = this.parent.statuses;
      const cached = this.parent._cache.statuses ?? new Set();
      const changed = new Set([...statuses].filter(s => !cached.has(s)));
      for (const s of cached) { if (!statuses.has(s)) { changed.add(s); } }
      this.parent._cache.statuses = new Set(statuses);
      return changed;
    }

    /**
     * Add a virtual condition to this actor.
     * @param {Teriock.Keys.Condition} status
     * @param {TeriockDocument|string} source
     */
    _addVirtualCondition(status, source) {
      VirtualCondition.addVirtualCondition(this.parent, status, source);
      this.parent.statuses.add(status);
    }

    /**
     * Add virtual conditions to this actor.
     * @param {Teriock.Keys.Condition} status
     * @param {TeriockDocument|string} source
     */
    _addVirtualConditions(statuses, source) {
      for (const status of statuses) {
        this._addVirtualCondition(status, source);
      }
    }

    /** @inheritDoc */
    getRollData() {
      const data = super.getRollData();
      for (const s of this.parent.statuses) { data[`status.${toKebabCase(s)}`] = 1; }
      return data;
    }

    /** @inheritDoc */
    async postUpdate() {
      await super.postUpdate();
      const changedStatuses = this.#consumeChangedStatuses();
      if (changedStatuses.size) {
        await BaseExpiration.massExpire([this.parent], StatusExpiration.TYPE, { changedStatuses });
      }
    }

    /** @inheritDoc */
    prepareCleanupData() {
      super.prepareCleanupData();
      this.#cleanConditionInformation();
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      for (const uuid of this.conditionInformation.allured.trackers) {
        this.conditionInformation.bound.trackers.add(uuid);
      }
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      this.#applyEffectConditionReasons();
      super.prepareVirtualEffects();
    }

    /**
     * Remove the status and all consequences that provide it. Intended to be used with conditions, but all
     * statuses work.
     * @param {Teriock.Keys.Status} status
     * @returns {Promise<void>}
     */
    async removeCondition(status) {
      await this.parent.toggleStatusEffect(status, { active: false });
      const toDelete = this.parent.applicables.filter(c => c.statuses.has(status)).map(c => c.id);
      await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
    }
  }

  return ActorConditionsPart;
}
