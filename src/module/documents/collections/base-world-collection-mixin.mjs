//eslint-disable-next-line @typescript-eslint/no-unused-vars
const { WorldCollection } = foundry.abstract;

/**
 * @param {typeof WorldCollection} Base
 * @constructor
 */
export default function BaseWorldCollectionMixin(Base) {
  //noinspection JSClosureCompilerSyntax,JSUnusedGlobalSymbols
  return (
    /**
     * @template TeriockDocument
     * @extends WorldCollection
     * @mixin
     */
    class BaseWorldCollection extends Base {
      /**
       * The documents that the user is an owner of.
       * @returns {TeriockDocument[]}
       */
      get owned() {
        return this.contents.filter((d) => d.isOwner);
      }
    }
  );
}
