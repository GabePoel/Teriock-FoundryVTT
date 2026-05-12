/**
 * Mixin for common functions used across document classes that embed children.
 * @param {typeof CommonDocument} Base
 */
export default function ParentDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @mixin
     */
    class ParentDocument extends Base {
      /**
       * @inheritDoc
       * @returns {Teriock.Documents.DocumentMetadata}
       */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { parent: true });
      }

      /**
       * Effect equivalent of {@link Actor.itemTypes}.
       * @returns {Record<string, AnyActiveEffect[]>}
       */
      get effectTypes() {
        return this.effects.documentsByType;
      }

      /**
       * Gets the list of {@link TeriockActiveEffect} documents associated with this document.
       * Helper method for prepareDerivedData() that can be called explicitly.
       * @returns {TeriockActiveEffect[]}
       */
      get validEffects() {
        return [];
      }

      /** @inheritDoc */
      _getByType(type) {
        if (TERIOCK.config.document[type]?.documentName === "ActiveEffect") {
          return (this.effectTypes[type] ?? []).filter(
            (e) => !e.isEphemeral && (e.system.revealed || game.user.isGM),
          );
        } else return super._getByType(type);
      }
    }
  );
}
