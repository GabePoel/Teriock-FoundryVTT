import affinityConfig from "../../../../../../constants/config/affinity-config.mjs";
import { AffinityPreviewModel } from "../../../../../../data/models/preview-models/_module.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { parseIdentifier } from "../../../../../../helpers/utils.mjs";

/**
 * How affinities are grouped.
 * @type {{ label: string, types: Teriock.Affinities.Type[] }[]}
 */
const AFFINITY_GROUPS = [
  { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.immunities", types: ["hexseal", "immunity"] },
  {
    label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.resistances",
    types: ["hexproof", "resistance", "vulnerability"],
  },
  { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.boosts", types: ["takeBoost", "takeDeboost"] },
  { label: "TERIOCK.SHEETS.Actor.TABS.Affinities.GROUPS.bindings", types: ["binding"] },
];

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PlayableActorSheetAffinitiesPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetAffinitiesPart extends Base {
      /**
       * A group for each kind of affinity, in the order given by {@link AFFINITY_GROUPS}.
       * @this {PlayableActorSheetAffinitiesPart}
       * @returns {Promise<Teriock.Previews.PreviewGroup[]>}
       */
      static async #previewGroupAffinity() {
        const entries = this.document.system.affinityEntries;
        return AFFINITY_GROUPS.map(group => ({
          docs: entries.filter(affinity => group.types.includes(affinity.type)),
          empty: _loc(group.label).toLowerCase(),
          optional: true,
        }));
      }

      /** @inheritDoc */
      static PREVIEWS = {
        ...super.PREVIEWS,
        affinity: {
          data: { display: { gapless: false, size: "medium" } },
          groups: this.#previewGroupAffinity,
          model: AffinityPreviewModel,
        },
      };

      /**
       * Prepare affinity roll buttons context.
       * @param {object} context
       */
      _prepareAffinityButtonContext(context) {
        context.affinityButtons = Object.entries(affinityConfig.types).filter(([, type]) => type.button).map(
          ([key, type]) => {
            return {
              affinityType: key,
              img: getImage(type.imgCategory, parseIdentifier(type.identifier).identifier),
              label: type.label,
              tooltip: type.button,
            };
          },
        );
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        this._prepareAffinityButtonContext(context);
        return context;
      }
    }
  );
}
