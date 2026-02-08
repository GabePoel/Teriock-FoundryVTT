/**
 * Mixin to ensure data models have access to the data they need.
 * @param {typeof DataModel | typeof TypeDataModel} Base
 */
export default function AccessDataMixin(Base) {
  return (
    /**
     * @extends {DataModel | TypeDataModel}
     * @mixin
     */
    class AccessData extends Base {
      /**
       * This data model's actor.
       * @returns {GenericActor}
       */
      get actor() {
        return this.parent.actor;
      }

      /**
       * This data model's document.
       * @returns {GenericCommon}
       */
      get document() {
        return this.parent.document;
      }

      /**
       * The UUID of this data model's document.
       * @returns {string}
       */
      get uuid() {
        return this.document.uuid;
      }

      /**
       * Roll data specific to this data model.
       * @returns {object}
       */
      getLocalRollData() {
        return {};
      }

      /**
       * Recursively fetch roll data.
       * @returns {object}
       */
      getRollData() {
        return this.parent.getRollData();
      }
    }
  );
}
