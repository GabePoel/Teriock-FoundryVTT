import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles conditions.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorConditionsPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorConditionsPartData}
     * @mixin
     */
    class ActorConditionsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          conditionInformation: new fields.SchemaField(
            objectMap(TERIOCK.index.conditions, () => {
              return new fields.SchemaField({
                locked: new fields.BooleanField(),
                reasons: new fields.SetField(new fields.StringField()),
                trackers: new fields.SetField(new fields.DocumentUUIDField()),
              });
            }),
            { persisted: false },
          ),
        });
      }

      /**
       * Copy active effect names into condition information.
       */
      #applyEffectConditionReasons() {
        for (const e of this.parent.validEffects) {
          for (const s of e.statuses) {
            if (!e.id.startsWith(s)) { this.conditionInformation[s]?.reasons.add(e.name); }
          }
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

      /** @inheritDoc */
      getRollData() {
        const data = super.getRollData();
        for (const s of this.parent.statuses) { data[`status.${s}`] = 1; }
        return data;
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
  );
}
