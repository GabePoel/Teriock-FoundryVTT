import { FakeConditionModel } from "../../../../../../data/models/_module.mjs";
import { conditionSort } from "../../../../../../helpers/sort.mjs";
import { TeriockTextEditor } from "../../../../../ux/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PlayableActorSheetConditionsPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetConditionsPart extends Base {
      /**
       * The rich tooltip for a condition the actor is forced into, which has no effect of its own to describe it.
       * @param {Teriock.Keys.Condition} condition
       * @returns {Promise<string>}
       */
      async #conditionTooltip(condition) {
        const panelParts = {
          associations: [],
          bars: [],
          blocks: [{
            text: TERIOCK.data.conditions[condition].description,
            title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
          }],
          icon: TERIOCK.config.document.condition.icon,
          image: TERIOCK.data.conditions[condition].img,
          name: TERIOCK.data.conditions[condition].name,
        };
        /** @type {TeriockTokenDocument[]} */
        const tokenDocs = Array.from(this.document.system.conditionInformation[condition]?.trackers ?? []).map(uuid =>
          fromUuidSync(uuid)
        ).filter(t => t);
        if (tokenDocs.length > 0) {
          panelParts.associations.push({
            cards: tokenDocs.map(tokenDoc => ({
              id: tokenDoc.id,
              img: tokenDoc.texture.src,
              makeTooltip: false,
              name: tokenDoc.name,
              type: "TokenDocument",
              uuid: tokenDoc.uuid,
            })),
            icon: TERIOCK.config.document.creature.icon,
            title: _loc("TERIOCK.SHEETS.Actor.CONDITIONS.Associations.title"),
          });
        }
        return TeriockTextEditor.makeTooltip(panelParts);
      }

      /**
       * The conditions this actor currently has, as fake documents a preview can render.
       * @returns {Promise<FakeConditionModel[]>}
       */
      async _fakeConditions() {
        /** @type {Record<Teriock.Keys.Condition, TeriockCondition>} */
        const effects = {};
        for (const c of this.actor.conditions) { effects[c.system.conditionKey] = c; }
        const live = conditionSort(
          Array.from(this.actor.statuses || []).filter(c => Object.keys(TERIOCK.index.conditions).includes(c)),
        );
        return Promise.all(live.map(async condition => {
          const info = this.document.system.conditionInformation[condition];
          const model = new FakeConditionModel({
            conditionKey: condition,
            locked: info.locked,
            providers: Array.from(info.reasons),
            // Only a forced condition renders from this; the rest use their own effect's tooltip.
            tooltip: info.locked ? await this.#conditionTooltip(condition) : "",
          }, { parent: this.document.system });
          model.effect = effects[condition];
          return model;
        }));
      }

      /**
       * Add conditions to rendering context.
       * @param {object} context
       */
      _prepareConditionContext(context) {
        context.removableConditions = this.actor.conditions.map(c => c.system.conditionKey);
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        this._prepareConditionContext(context);
        return context;
      }
    }
  );
}
