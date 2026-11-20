import { mergeMetadata } from "../../utils/_module.mjs";

/**
 * @import { ApplicationRenderOptions } from "@client/applications/_types.mjs";
 * @import { DocumentSheetV2 } from "@client/applications/api/_module.mjs";
 */

/**
 * Mixin for identifier tracking.
 * @template {MixinBase} T
 * @param {T} Base
 * @category Identifiers
 */
export default function IdentifierDocumentMixin(Base) {
  /** @mixin */
  class IdentifierDocument extends Base {
    /** @inheritDoc */
    static documentMetadata = mergeMetadata(super.documentMetadata, { identifier: { track: true } });

    /**
     * Get the identifier for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {Identifier}
     */
    static getIdentifier(doc) {
      return `${this.getIdentifierType(doc)}:${this.getIdentifierSlug(doc)}`;
    }

    /**
     * Get the identifier slug for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {Slug}
     */
    static getIdentifierSlug(doc) {
      return foundry.utils.getProperty(doc, "system.slug") || teriock.utils.toSlug(doc.name);
    }

    /**
     * Get the identifier type for one of these documents.
     * @param {TeriockDocument|object} doc
     * @returns {Slug}
     */
    static getIdentifierType(doc) {
      if (doc.type) { return teriock.utils.toSlug(doc.type, { convertCamel: true }); }
      return teriock.utils.toSlug(this.documentName, { convertCamel: true });
    }

    /**
     * This document's identifier.
     * @returns {Identifier}
     */
    get identifier() {
      return this.constructor.getIdentifier(this);
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

/**
 * Adds a middle click option to the copy UUID button in sheet headers.
 * @param {DocumentSheetV2} application
 * @param {HTMLElement} _element
 * @param {object} _context
 * @param {ApplicationRenderOptions} options
 * @see {renderApplicationV2}
 * @category Identifiers
 */
function addIdentifierClipboardListener(application, _element, _context, options) {
  if (!options.isFirstRender || !application.window.header) { return; }
  const type = _loc("TERIOCK.COMMON.Identifier").toLocaleLowerCase(game.i18n.lang);
  const label = _loc(application.document.constructor.metadata.label);
  application.window.header.querySelectorAll("[data-action=copyUuid]").forEach(el =>
    el.addEventListener("auxclick", async e => {
      if (e.button !== 1) { return; }
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      const id = application.document?.identifier;
      if (!id || application.document?.isSecret) {
        ui.notifications.warn("TERIOCK.SHEETS.Common.NOTIFICATIONS.noIdentifier", {
          format: { label },
          localize: true,
        });
        return;
      }
      await game.clipboard.copyPlainText(id);
      ui.notifications.info("DOCUMENT.IdCopiedClipboard", { format: { id, label, type } });
    })
  );
}
Hooks.on("renderDocumentSheetV2", addIdentifierClipboardListener);
