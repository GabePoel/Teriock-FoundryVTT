import { prefixObject } from "../../../../../../../utils/_module.mjs";
import { AttributeModel } from "../../../../../../models/_module.mjs";

/**
 * @import { FeatExecution } from "../../../../../../../executions/activity-executions/feat-execution.mjs";
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { EmbeddedDataField, SchemaField } = foundry.data.fields;

/**
 * Actor data model mixin that handles attributes.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 * @see {AttributeModel}
 * @see {FeatExecution}
 */
export default function ActorAttributesPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorAttributesPartData}
   * @property {TeriockActor} parent
   */
  class ActorAttributesPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.ActorAttributesPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      const attributes = {};
      Object.entries(TERIOCK.CONFIG.attribute).forEach((
        [key, value],
      ) => (attributes[key] = new EmbeddedDataField(AttributeModel, {
        label: value.label,
        initial: () => ({ competence: { raw: 0 }, score: -3 }),
      })));
      return Object.assign(super.defineSchema(), { attributes: new SchemaField(attributes) });
    }

    /**
     * Prepare presence.
     */
    #preparePresence() {
      this.presence.value = this.actor?.previewedTypes.attunement.filter(a => a.active).reduce(
        (sum, a) => sum + a.system.tier,
        0,
      );
      this.presence.over = this.presence.value > this.presence.max;
      this.presence.value = Math.min(this.presence.value, this.presence.max);
      this.attributes.unp.score = this.presence.max - this.presence.value;
    }

    /** @inheritDoc */
    getRollData() {
      const rollData = super.getRollData();
      for (const att of Object.values(this.attributes)) {
        const data = att.getLocalRollData();
        Object.assign(rollData, prefixObject(data, `${att.key}`));
      }
      return rollData;
    }

    /** @inheritDoc */
    prepareSpecialData() {
      super.prepareSpecialData();
      this.#preparePresence();
    }
  }

  return ActorAttributesPart;
}
