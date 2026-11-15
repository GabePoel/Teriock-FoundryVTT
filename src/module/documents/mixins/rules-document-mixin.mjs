/**
 * Mixin for identifier tracking.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function RulesDocumentMixin(Base) {
  /** @mixin */
  class RulesDocument extends Base {
    /** @inheritDoc */
    static get documentMetadata() {
      return Object.assign(super.documentMetadata, { rules: true });
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
     * This document's identifier, if it has one.
     * @returns {TypedIdentifier|null}
     */
    get identifier() {
      const type = this.type;
      const identifier = this.system?.identifier;
      return Boolean(type) && Boolean(identifier) ? `${type}:${identifier}` : null;
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

  return RulesDocument;
}
