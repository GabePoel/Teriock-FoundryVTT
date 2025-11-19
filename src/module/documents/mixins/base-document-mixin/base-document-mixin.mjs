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
       * @returns {Teriock.Foundry.ContextMenuEntry[]}
       */
      get cardContextMenuEntries() {
        const entries = [];
        if (this.system?.cardContextMenuEntries) {
          entries.push(...this.system.cardContextMenuEntries);
        }
        entries.push(
          ...[
            {
              name: "Open Source",
              icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
              callback: async () => await this.source.sheet.render(true),
              condition: () => this.source?.isViewer,
              group: "open",
            },
            {
              name: "Delete",
              icon: makeIcon("trash", "contextMenu"),
              callback: async () => await this.safeDelete(),
              condition: () => this.isOwner,
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
       * The document this descends from, either determined by Foundry or the system.
       */
      get source() {
        return this.parent;
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
