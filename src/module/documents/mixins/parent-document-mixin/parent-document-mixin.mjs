/**
 * Mixin for common functions used across document classes that embed children.
 * @param {typeof CommonDocument} Base
 * @constructor
 */
export default function ParentDocumentMixin(Base) {
  return (
    /**
     * @implements {ParentDocumentMixinInterface}
     * @extends {ClientDocument}
     * @mixin
     */
    class ParentDocument extends Base {
      /**
       * @inheritDoc
       * @returns {TeriockAbility[]}
       */
      get abilities() {
        return this.effectTypes?.ability || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockAttunement[]}
       */
      get attunements() {
        return this.effectTypes?.attunement || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockCondition[]}
       */
      get conditions() {
        return this.effectTypes?.condition || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockConsequence[]}
       */
      get consequences() {
        return this.effectTypes?.consequence || [];
      }

      /**
       * Effect keys by type.
       * @returns {Teriock.Parent.ParentEffectKeys}
       */
      get effectKeys() {
        const out = {};
        const effectTypes = this.effectTypes;
        for (const key of Object.keys(TERIOCK.system.documentTypes.effects)) {
          out[key] = new Set(effectTypes[key] || []);
        }
        return out;
      }

      /**
       * Effects by type.
       * @returns {Teriock.Parent.ParentEffectTypes}
       */
      get effectTypes() {
        const effectTypes = {};
        for (const effect of this.validEffects) {
          if (Object.keys(effectTypes).includes(effect.type)) {
            effectTypes[effect.type].push(effect);
          } else {
            effectTypes[effect.type] = [effect];
          }
        }
        return effectTypes;
      }

      /**
       * @inheritDoc
       * @returns {TeriockFluency[]}
       */
      get fluencies() {
        return this.effectTypes?.fluency || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockProperty[]}
       */
      get properties() {
        return this.effectTypes?.property || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockResource[]}
       */
      get resources() {
        return this.effectTypes?.resource || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockEffect[]}
       */
      get validEffects() {
        return [];
      }

      /**
       * Remove documents that aren't valid child types from creation data.
       * @param {TeriockChildName} embeddedName
       * @param {object[]} data
       */
      _filterDocumentCreationData(embeddedName, data) {
        if (embeddedName === "ActiveEffect") {
          for (let i = data.length - 1; i >= 0; i--) {
            const effectData = data[i];
            if (
              foundry.utils.hasProperty(effectData, "type") &&
              !this.metadata.childEffectTypes.includes(
                foundry.utils.getProperty(effectData, "type"),
              )
            ) {
              data.splice(i, 1);
            }
          }
        } else if (embeddedName === "Item") {
          for (let i = data.length - 1; i >= 0; i--) {
            const itemData = data[i];
            if (
              foundry.utils.hasProperty(itemData, "type") &&
              !this.metadata.childItemTypes.includes(
                foundry.utils.getProperty(itemData, "type"),
              )
            ) {
              data.splice(i, 1);
            }
          }
        }
      }

      /** @inheritDoc */
      getAbilities() {
        return this.abilities.filter((a) => !a.sup);
      }

      /** @inheritDoc */
      getBodyParts() {
        return [];
      }

      /** @inheritDoc */
      getEquipment() {
        return [];
      }

      /** @inheritDoc */
      getProperties() {
        return this.properties.filter((p) => !p.sup);
      }

      /** @inheritDoc */
      getRanks() {
        return [];
      }

      /** @inheritDoc */
      prepareSpecialData() {
        this.effects.forEach((e) => {
          e.prepareSpecialData();
        });
        super.prepareSpecialData();
      }
    }
  );
}
