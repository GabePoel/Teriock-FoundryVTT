import { TeriockDialog } from "../../applications/api/_module.mjs";
import { icons } from "../../constants/display/icons.mjs";
import { toId } from "../../helpers/string.mjs";
import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

/**
 * Base mixin.
 * @param {typeof ClientDocument} Base
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

      /**
       * Prefix to use in {@link _benchmarkStart} and {@link _benchmarkEnd}.
       * @returns {string}
       */
      get _benchmarkString() {
        return `${this.name}.${this.type}.${toId(this.collection ? this.uuid : this.name, { hash: true })}`;
      }

      /**
       * The default identifier for this document.
       * @returns {string}
       */
      get defaultIdentifier() {
        return tm.string.toKebabCase(this.name);
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
       * A modified version of this document's name that displays additional text if needed.
       * @returns {string}
       */
      get nameString() {
        return this.system?.nameString || this.name;
      }

      /**
       * Helper to start a benchmark.
       * @param {string} key
       */
      _benchmarkEnd(key) {
        console.timeEnd(`${key} - ${this._benchmarkString}`);
      }

      /**
       * Helper to end a benchmark.
       * @param {string} key
       */
      _benchmarkStart(key) {
        console.time(`${key} - ${this._benchmarkString}`);
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
              name: game.i18n.localize(
                "TERIOCK.SYSTEMS.Common.MENU.openSource",
              ),
              icon: makeIcon(
                TERIOCK.display.icons.ui.openWindow,
                "contextMenu",
              ),
              callback: async () => await this.elder.sheet.render(true),
              condition: () =>
                this.elder?.isViewer && doc?.uuid !== this.elder?.uuid,
              group: "open",
            },
            {
              name: game.i18n.localize("TERIOCK.SYSTEMS.Common.MENU.delete"),
              icon: makeIcon(TERIOCK.display.icons.ui.delete, "contextMenu"),
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
            title: game.i18n.format("TERIOCK.SYSTEMS.Common.MENU.safeDelete", {
              name: this.nameString || this.name,
            }),
            icon: makeIconClass(icons.ui.delete, "title"),
          },
          content: game.i18n.localize("TERIOCK.SYSTEMS.Common.DIALOG.delete"),
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
