/** @import Document from "@common/abstract/document.mjs"; */
import { ChildDocumentMixin } from "./child-mixin.mjs";

export const EffectMixin = (Base) =>
  class EffectMixin extends ChildDocumentMixin(Base) {
    /**
     * Disables the effect, setting its `disabled` property to true.
     * @returns {Promise<void>}
     */
    async disable() {
      await this.update({ disabled: true });
    }

    /**
     * Enables the effect, setting its `disabled` property to false.
     * @returns {Promise<void>}
     */
    async enable() {
      await this.update({ disabled: false });
    }

    /**
     * Toggles the `disabled` state of the effect.
     * If the effect is currently disabled, it will be enabled, and vice versa.
     * @returns {Promise<void>}
     */
    async toggleDisabled() {
      await this.update({ disabled: !this.disabled });
    }

    /**
     * @returns {Promise<void>}
     */
    async forceUpdate() {
      await this.update({ "system.updateCounter": !this.system.updateCounter });
    }

    /** @inheritdoc */
    getEmbeddedDocument(embeddedName, id, { invalid = false, strict = false } = {}) {
      const systemEmbeds = this.system?.constructor.metadata.embedded ?? {};
      if (embeddedName in systemEmbeds) {
        const path = systemEmbeds[embeddedName];
        return foundry.utils.getProperty(this, path).get(id, { invalid, strict }) ?? null;
      }
      return super.getEmbeddedDocument(embeddedName, id, { invalid, strict });
    }

    /* -------------------------------------------------- */

    /**
     * Obtain the embedded collection of a given pseudo-document type.
     * @param {string} embeddedName   The document name of the embedded collection.
     * @returns {ModelCollection}     The embedded collection.
     */
    getEmbeddedPseudoDocumentCollection(embeddedName) {
      const collectionPath = this.system?.constructor.metadata.embedded?.[embeddedName];
      if (!collectionPath) {
        throw new Error(
          `${embeddedName} is not a valid embedded Pseudo-Document within the [${this.type}] ${this.documentName} subtype!`,
        );
      }
      return foundry.utils.getProperty(this, collectionPath);
    }

    /* -------------------------------------------------- */

    /** @inheritdoc */
    prepareBaseData() {
      super.prepareBaseData();
      const documentNames = Object.keys(this.system?.constructor.metadata?.embedded ?? {});
      for (const documentName of documentNames) {
        for (const pseudoDocument of this.getEmbeddedPseudoDocumentCollection(documentName)) {
          pseudoDocument.prepareBaseData();
        }
      }
    }

    /* -------------------------------------------------- */

    /** @inheritdoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      const documentNames = Object.keys(this.system?.constructor.metadata?.embedded ?? {});
      for (const documentName of documentNames) {
        for (const pseudoDocument of this.getEmbeddedPseudoDocumentCollection(documentName)) {
          pseudoDocument.prepareDerivedData();
        }
      }
    }
  };