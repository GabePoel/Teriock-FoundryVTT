import { mixClasses } from "../../../helpers/construction.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";
import { PseudoCollection } from "../collections/_module.mjs";
import { OverrideCompetencePseudoDocumentMixin, SelectionPseudoDocumentMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

export default class ConstructionNode
  extends mixClasses(BasePseudoDocument, SelectionPseudoDocumentMixin, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "ConstructionNode" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { delta: new fields.JSONField(), parentId: new fields.StringField() });
  }

  /**
   * The nodes that are children of this one.
   * @type {PseudoCollection<ConstructionNode>}
   */
  childNodes = new PseudoCollection();

  /**
   * Whether this is the root of the construction node tree.
   * @returns {boolean}
   */
  get isRoot() {
    return !this.parentNode && Boolean(this.collection.find(n => !n.parentNode) === this);
  }

  /**
   * The node that is a parent of this one.
   * @returns {ConstructionNode|null}
   */
  get parentNode() {
    return this.collection.get(this.parentId) ?? null;
  }

  /**
   * Construct documents for this node.
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<object>}
   */
  async constructDocuments(scope = {}) {
    const data = (await this.selectDocuments()).map(d => d.toObject());
    if (!data.length) { data.push({}); }
    for (const d of data) {
      foundry.utils.mergeObject(d, this.delta, { inplace: true });
      d.children ??= [];
      foundry.utils.setProperty(d, "system.competence.raw", this.getCompetence(scope));
      for (const n of this.childNodes.contents) {
        const children = await n.constructDocuments();
        d.children.push(...children);
      }
    }
    return data;
  }

  /** @inheritDoc */
  getCompetence(scope = {}) {
    if (this.setCompetence === "inherit" && this.parentNode) { return this.parentNode.getCompetence(scope); }
    return super.getCompetence(scope);
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.parentNode?.childNodes.addDocuments([this]);
  }
}
