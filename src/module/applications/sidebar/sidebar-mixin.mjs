/**
 * @param {typeof DocumentDirectory} Base
 */
export default function SidebarMixin(Base) {
  return (
    /**
     * @extends {DocumentDirectory}
     * @mixin
     */
    class Sidebar extends Base {
      static _entryPartial = "teriock/sidebar/document-partial";

      /**
       * Get the document that corresponds to a certain list item.
       * @param {HTMLLIElement} li
       * @returns {AnyCommonDocument}
       */
      _getDocumentFromLi(li) {
        /** @type {HTMLElement} */
        const entryElement = li.closest("[data-entry-id]");
        return this.collection.get(entryElement?.dataset.entryId);
      }
    }
  );
}
