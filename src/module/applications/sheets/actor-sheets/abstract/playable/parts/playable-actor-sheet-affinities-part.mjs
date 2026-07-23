import affinityConfig from "../../../../../../constants/config/affinity-config.mjs";
import { getImage } from "../../../../../../helpers/path.mjs";
import { parseIdentifier } from "../../../../../../helpers/utils.mjs";

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
