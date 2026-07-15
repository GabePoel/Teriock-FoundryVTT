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
       * Add conditions to rendering context.
       * @param {object} context
       */
      async _prepareConditionContext(context) {
        const removableConditions = this.actor.conditions.map(c => c.system.conditionKey);
        const liveConditions = conditionSort(
          Array.from(this.actor.statuses || []).filter(c => Object.keys(TERIOCK.index.conditions).includes(c)),
        );
        Object.assign(context, { conditions: liveConditions, removableConditions });
        context.conditionsMap = {};
        for (const c of this.actor.conditions) { context.conditionsMap[c.system.conditionKey] = c; }
        context.conditionProviders = {};
        context.conditionTooltips = {};
        for (const condition of Object.keys(TERIOCK.index.conditions)) {
          context.conditionProviders[condition] = Array.from(
            this.document.system.conditionInformation[condition].reasons,
          );
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
          const tokenDocs = Array.from(this.document.system.conditionInformation[condition]?.trackers).map(uuid =>
            fromUuidSync(uuid)
          ).filter(t => t);
          if (tokenDocs.length > 0) {
            /** @type {Teriock.Panels.PanelAssociation} */
            const association = {
              cards: [],
              icon: TERIOCK.config.document.creature.icon,
              title: _loc("TERIOCK.SHEETS.Actor.CONDITIONS.Associations.title"),
            };
            for (const tokenDoc of tokenDocs) {
              association.cards.push({
                id: tokenDoc.id,
                img: tokenDoc.texture.src,
                makeTooltip: false,
                name: tokenDoc.name,
                type: "TokenDocument",
                uuid: tokenDoc.uuid,
              });
            }
            panelParts.associations.push(association);
          }
          context.conditionTooltips[condition] = await TeriockTextEditor.makeTooltip(panelParts);
        }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareConditionContext(context);
        return context;
      }
    }
  );
}
