import { TeriockDialog } from "../../applications/api/_module.mjs";
import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

/**
 * Base mixin.
 * @param {typeof TeriockDocument} Base
 * @mixin
 */
export default function BaseDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @mixin
     */
    class BaseDocument extends Base {
      /** @returns {Teriock.Documents.DocumentMetadata} */
      static get documentMetadata() {
        return {
          child: false,
          common: false,
          hierarchy: false,
          parent: false,
          tooltip: false,
          typed: false,
          types: /** @type {Teriock.Documents.CommonType[]} */ [],
        };
      }

      /** @returns {Teriock.Documents.DocumentMetadata} */
      get documentMetadata() {
        return this.constructor.documentMetadata;
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
       * Check if the {@link TeriockUser} owns and uses this.
       * @param  {TeriockUser | ID<TeriockUser>} user
       * @returns {false|boolean|boolean|*}
       */
      checkEditor(user) {
        return game.user.id === (user.id || user._id || user) && this.isOwner;
      }

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
                this.isOwner &&
                this.checkAncestor(doc) &&
                doc?.sheet.isEditable,
              group: "document",
            },
          ],
        );
        return entries;
      }

      /**
       * Get a specific schema field.
       * @param {string} path
       * @returns {DataField}
       */
      getSchema(path) {
        let schema;
        if (path.startsWith("system")) {
          schema = this.system.schema.getField(path.replace("system.", ""));
        } else {
          schema = this.schema.getField(path);
        }
        return schema;
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
