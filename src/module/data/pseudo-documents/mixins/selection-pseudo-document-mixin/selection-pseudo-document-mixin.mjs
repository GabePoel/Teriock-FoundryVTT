import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";
import { formulaExists } from "../../../../helpers/formula.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/** Every selection field path, in the order they are rendered. */
const SELECTION_PATHS = [
  "globalUuids",
  "globalIdentifiers",
  "localUuids",
  "localIdentifiers",
  "localQualifier",
  "expandFolders",
  "expandTables",
  "multi",
  "all",
  "auto",
];

/**
 * Selecting documents from a stored {@link Teriock.Select.DocumentSelectionConfig}.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, SelectionPseudoDocument & Teriock.PseudoDocuments.SelectionPseudoDocumentData>}
 */
export default function SelectionPseudoDocumentMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.PseudoDocuments.SelectionPseudoDocumentData}
   */
  class SelectionPseudoDocument extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.PSEUDOS.Selection"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        all: new fields.BooleanField(),
        auto: new fields.BooleanField({ initial: true }),
        expandFolders: new fields.BooleanField({ initial: true }),
        expandTables: new fields.BooleanField({ initial: true }),
        globalIdentifiers: new TypedIdentifierSetField(),
        globalUuids: new fields.SetField(new fields.DocumentUUIDField()),
        localIdentifiers: new TypedIdentifierSetField(),
        localQualifier: qualifierField(),
        localUuids: new fields.SetField(new fields.DocumentUUIDField({ relative: true })),
        multi: new fields.BooleanField(),
      });
    }

    /**
     * @returns {Teriock.Select.DocumentSelectionConfig}
     */
    get #selectionConfig() {
      return { ...this.#selectionData, relativeTo: this._selectionRelativeTo, filter: d => this._isSelectable(d) };
    }

    /**
     * The stored selection fields.
     * @returns {object}
     */
    get #selectionData() {
      return Object.fromEntries(SELECTION_PATHS.filter(p => this.schema.has(p)).map(p => [p, this[p]]));
    }

    /**
     * If this can only select one document then this gives that. Otherwise, it gives `null`.
     * @param {Teriock.Select.DocumentSelectionConfig} overrides
     * @returns {Promise<TeriockDocument|null>}
     */
    async #onlySelectableDocument(overrides) {
      if (formulaExists(this.localQualifier)) { return null; }
      const sources = (this.globalUuids?.size ?? 0) + (this.globalIdentifiers?.size ?? 0)
        + (this.localUuids?.size ?? 0) + (this.localIdentifiers?.size ?? 0);
      if (sources !== 1) { return null; }
      const documents = await this.getSelectableDocuments(overrides);
      return documents.length === 1 ? documents[0] : null;
    }

    /**
     * A selection that resolves to exactly the given documents without prompting again.
     * @param {TeriockDocument[]} documents
     * @returns {object}
     */
    #resolvedData(documents) {
      return { all: true, auto: true, multi: true, ...this.#sourcesFor(documents) };
    }

    /**
     * Whether a selection field should currently be shown.
     * @param {string} path
     * @returns {boolean}
     */
    #showsSelectionPath(path) {
      if (path === "all") { return this.multi; }
      if (path === "auto") { return !this.multi || !this.all; }
      return true;
    }

    /**
     * Sources that resolve to exactly the given documents.
     * @param {TeriockDocument[]} documents
     * @returns {object}
     */
    #sourcesFor(documents) {
      return {
        globalIdentifiers: [],
        globalUuids: documents.map(d => d.uuid),
        localIdentifiers: [],
        localQualifier: "",
        localUuids: [],
      };
    }

    /** @inheritDoc */
    get _inputContextKey() {
      return this.schema.has("localQualifier") ? "child" : super._inputContextKey;
    }

    /**
     * Paths for every selection field this defines and currently wants shown.
     * @returns {string[]}
     */
    get _selectionPaths() {
      return SELECTION_PATHS.filter(p => this.schema.has(p) && this.#showsSelectionPath(p));
    }

    /**
     * The document that local sources are resolved against.
     * @returns {TeriockActiveEffect|TeriockActor|TeriockItem|null}
     */
    get _selectionRelativeTo() {
      return this.actor ?? null;
    }

    /**
     * Title for the selection dialog.
     * @returns {string}
     */
    get _selectionTitle() {
      return this.getNearestDocument()?.fullName || this.getNearestDocument()?.name || this.label;
    }

    /**
     * Whether anything is configured to select from.
     * @returns {boolean}
     */
    get hasSelection() {
      return this.globalUuids?.size > 0 || this.globalIdentifiers?.size > 0 || this.localUuids?.size > 0
        || this.localIdentifiers?.size > 0 || formulaExists(this.localQualifier);
    }

    /**
     * Selection configs for the activations this creates and possible paired document.
     * @param {Teriock.Select.DocumentSelectionConfig} [overrides]
     * @returns {Promise<{ config: object, document: TeriockDocument|null }|null>}
     */
    async _getSelection(overrides = {}) {
      if (!this.hasSelection) { return null; }
      if (!this.interactInExecution) {
        return { config: this.#selectionData, document: await this.#onlySelectableDocument(overrides) };
      }
      const documents = await this.selectDocuments(overrides);
      if (!documents.length) { return null; }
      return { config: this.#resolvedData(documents), document: null };
    }

    /**
     * Whether a resolved document is a valid choice.
     * @param {TeriockActiveEffect|TeriockActor|TeriockItem} _document
     * @returns {boolean}
     */
    _isSelectable(_document) {
      return true;
    }

    /** @inheritDoc */
    _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
      if (path === "localIdentifiers") {
        inputConfig.suggestions = this._selectionRelativeTo?.previewed.getNames({ filter: d => this._isSelectable(d) });
      }
      return super._makeFormGroup(path, groupConfig, inputConfig, config);
    }

    /**
     * Every document this can select from.
     * @param {Teriock.Select.DocumentSelectionConfig} [overrides]
     * @returns {Promise<TeriockDocument[]>}
     */
    async getSelectableDocuments(overrides = {}) {
      return DocumentSelector.getFromConfig({ ...this.#selectionConfig, ...overrides });
    }

    /**
     * Prompt for the documents this selects when there's a choice to be made.
     * @param {Teriock.Select.DocumentSelectionConfig} [overrides]
     * @returns {Promise<TeriockDocument[]>}
     */
    async selectDocuments(overrides = {}) {
      const documents = await this.getSelectableDocuments(overrides);
      return DocumentSelector.selectFromConfig({
        ...this.#selectionConfig,
        ...overrides,
        ...this.#sourcesFor(documents),
      }, { title: this._selectionTitle });
    }
  }

  return SelectionPseudoDocument;
}
