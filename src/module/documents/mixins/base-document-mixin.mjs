import { resolveDocument } from "../../helpers/resolve.mjs";
import { toId } from "../../helpers/string.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

/**
 * Base mixin.
 * @param {typeof ClientDocument} Base
 * @mixin
 */
export default function BaseDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @property {Readonly<boolean>} isOwner
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
       * A guaranteed identifier for this.
       * @returns {string}
       */
      get forcedIdentifier() {
        return this.system?.identifier ?? this.defaultIdentifier;
      }

      /**
       * A modified version of this document's name that displays additional text if needed.
       * @returns {string}
       */
      get fullName() {
        return this.system?.fullName || this.name;
      }

      /**
       * Whether this document shouldn't have its basic information like compendium source and identifier visible.
       * @return {boolean}
       */
      get isSecret() {
        if (this.system) return this.system.isSecret;
        return false;
      }

      /**
       * Can this be viewed?
       * @returns {boolean}
       */
      get isViewer() {
        return this.permission >= 2;
      }

      /**
       * That document that has the most control over this one.
       * @return {SyncDoc<CommonDocument>}
       */
      get master() {
        return this.parent;
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
       * Check whether it's valid for this document to be edited from another one. This is mainly intended for use
       * in {@link getCardContextMenuEntries}. If this document appears as an embedded card (via `@EMBED`) or
       * otherwise has its context menu entries shown in a sheet for some document, only some of them should be visible.
       * @param {TeriockDocument} doc
       * @param {object} [options]
       * @param {boolean} [options.editable] - Require the document's sheet to be editable.
       * @param {boolean} [options.self] - Whether the document must or must not be this one.
       * @returns {boolean}
       */
      _checkValidEditorDocument(doc, options = {}) {
        const { editable = true, self = undefined } = options;
        if (self === false && doc === this) return false;
        if (self === true && doc !== this) return false;
        return (
          this.isOwner &&
          (this.checkAncestor(doc) || this.master === doc || this === doc) &&
          (doc?.sheet.isEditable || !editable)
        );
      }

      /**
       * Check whether the provided document or its index is an ancestor of this one.
       * @param {TeriockDocument|Index<TeriockDocument>} doc
       */
      checkAncestor(doc) {
        if (doc?.uuid === this.uuid) return true;
        return this.parent?.checkAncestor(doc) || false;
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
       * @returns {ContextMenuEntry[]}
       */
      getCardContextMenuEntries(doc) {
        const entries = [];
        if (this.system?.getCardContextMenuEntries) {
          entries.push(...this.system.getCardContextMenuEntries(doc));
        }
        entries.push(
          ...[
            {
              name: _loc("TERIOCK.SYSTEMS.Common.MENU.openSource"),
              icon: makeIcon(
                TERIOCK.display.icons.ui.openWindow,
                "contextMenu",
              ),
              callback: async () => {
                const resolved = await resolveDocument(this.master);
                if (resolved) await resolved.sheet?.render(true);
              },
              condition: () =>
                this.master?.isViewer && doc?.uuid !== this.master?.uuid,
              group: "open",
            },
            {
              name: _loc("TERIOCK.SYSTEMS.Common.MENU.delete"),
              icon: makeIcon(TERIOCK.display.icons.ui.delete, "contextMenu"),
              callback: async () => await this.deleteDialog(),
              condition: () =>
                this._checkValidEditorDocument(doc, { self: false }),
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
    }
  );
}
