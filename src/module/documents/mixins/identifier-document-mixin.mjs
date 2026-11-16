import { mergeMetadata } from "../../utils/_module.mjs";

/**
 * Mixin for identifier tracking.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function IdentifierDocumentMixin(Base) {
  /** @mixin */
  class IdentifierDocument extends Base {
    /** @inheritDoc */
    static documentMetadata = mergeMetadata(super.documentMetadata, { identifier: { track: true } });

    /**
     * Get the identifier for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {TypedIdentifier}
     */
    static getIdentifier(doc) {
      return `${this.getIdentifierType(doc)}:${this.getIdentifierSlug(doc)}`;
    }

    /**
     * Get the identifier slug for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {Identifier}
     */
    static getIdentifierSlug(doc) {
      return foundry.utils.getProperty(doc, "system.identifier") || teriock.utils.toSlug(doc.name);
    }

    /**
     * Get the identifier type for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {Identifier}
     */
    static getIdentifierType(doc) {
      if (doc.type) { return teriock.utils.toSlug(doc.type, { convertCamel: true }); }
      return teriock.utils.toSlug(this.documentName, { convertCamel: true });
    }

    /**
     * The default identifier for this document.
     * @returns {Identifier}
     */
    get defaultIdentifier() {
      return teriock.utils.toSlug(this.name);
    }

    /**
     * A guaranteed identifier for this.
     * @returns {Identifier}
     */
    get forcedIdentifier() {
      return this.system?.identifier ?? this.defaultIdentifier;
    }

    /**
     * This document's identifier.
     * @returns {TypedIdentifier}
     */
    get identifier() {
      return this.constructor.getIdentifier(this);
    }

    /**
     * A key that can be looked up to find this document.
     * @returns {TypedIdentifier}
     */
    get lookupKey() {
      return this.identifier ?? `${this.type}:${this.forcedIdentifier}`;
    }

    /** @inheritDoc */
    _onCreate(data, options, userId) {
      super._onCreate(data, options, userId);
      // Extra tracking for world documents created during the game.
      game.teriock.identifiers.trackDocument(this);
      this._cache.identifier = this.identifier;
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      game.teriock.identifiers.untrackDocument(this);
    }

    /** @inheritDoc */
    prepareData() {
      super.prepareData();
      if (this.trackable) { game.teriock.identifiers.untrack(this._cache.identifier, this.uuid); }
      if (this.persisted) { game.teriock.identifiers.trackDocument(this); }
      this._cache.identifier = this.identifier;
    }

    /** @inheritDoc */
    toDragData() {
      return Object.assign(super.toDragData(), { identifier: this.identifier });
    }
  }

  return IdentifierDocument;
}
