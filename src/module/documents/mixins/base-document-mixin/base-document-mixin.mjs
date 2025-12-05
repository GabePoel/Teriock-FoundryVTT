import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { makeIcon, makeIconClass } from "../../../helpers/utils.mjs";

/**
 * Base mixin.
 * @param {typeof TeriockDocument} Base
 * @constructor
 * @mixin
 */
export default function BaseDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     */
    class BaseDocument extends Base {
      /**
       * Context menu entries to display for cards that represent this document.
       * @param {TeriockDocument} doc
       * @returns {Teriock.Foundry.ContextMenuEntry[]}
       */
      getCardContextMenuEntries(doc) {
        const entries = [];
        if (this.system?.getCardContextMenuEntries) {
          entries.push(...this.system.getCardContextMenuEntries(doc));
        }
        entries.push(
          ...[
            {
              name: "Open Source",
              icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
              callback: async () => await this.elder.sheet.render(true),
              condition: () =>
                this.elder?.isViewer && doc?.uuid !== this.elder?.uuid,
              group: "open",
            },
            {
              name: "Delete",
              icon: makeIcon("trash", "contextMenu"),
              callback: async () => await this.safeDelete(),
              condition: () =>
                this.isOwner && this.checkAncestor(doc) && doc?.sheet.editable,
              group: "document",
            },
          ],
        );
        return entries;
      }

      /**
       * Can this be viewed?
       * @returns {boolean}
       */
      get isViewer() {
        return this.permission >= 2;
      }

      /**
       * Check whether the provided document or its index is an ancestor of this one.
       * @param {TeriockDocument|Index<TeriockDocument>} doc
       */
      checkAncestor(doc) {
        if (doc?.uuid === this.uuid) {
          return true;
        } else {
          return this.parent?.checkAncestor(doc) || false;
        }
      }

      /**
       * Ask for confirmation before deleting.
       * @returns {Promise<void>}
       */
      async safeDelete() {
        const remove = await TeriockDialog.confirm({
          window: {
            title: `Delete ${this.nameString || this.name}`,
            icon: makeIconClass("trash", "title"),
          },
          content:
            "Are you sure you want to delete this? This can't be reversed.",
          modal: true,
          rejectClose: false,
        });
        if (remove) {
          await this.delete();
        }
      }
    }
  );
}
