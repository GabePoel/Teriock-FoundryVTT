import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { toId } from "../../../helpers/string.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";
import { PseudoCollection } from "../collections/_module.mjs";
import {
  OverrideCompetencePseudoDocumentMixin,
  OverrideDataPseudoDocumentMixin,
  SelectionPseudoDocumentMixin,
} from "../mixins/_module.mjs";

const { fields } = foundry.data;

export default class ConstructionNode
  extends mixClasses(
    BasePseudoDocument,
    SelectionPseudoDocumentMixin,
    OverrideCompetencePseudoDocumentMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { documentName: "ConstructionNode" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      omit(super.defineSchema(), ["expandFolders", "expandTables", "makeSeparateActivations", "selectInExecution"]),
      { parentId: new fields.StringField() },
    );
  }

  /** @inheritDoc */
  static async deleteDocuments(ids = [], operation = {}) {
    const resolved = await this._resolveParent(operation);
    const pseudos = ids.map(id => resolved.parent.getEmbeddedDocument(this.documentName, id));
    const allIds = new Set();
    for (const p of pseudos) {
      allIds.add(p.id);
      const newIds = p.allChildNodes.contents.map(node => node.id);
      for (const id of newIds) { allIds.add(id); }
    }
    await super.deleteDocuments(Array.from(allIds), operation);
    return pseudos;
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._selectionPaths, "hr", ...this._competencePaths, "hr", ...this._overrideDataPaths, "hr"];
  }

  /**
   * All the construction nodes which descend from this.
   * @returns {PseudoCollection<ConstructionNode>}
   */
  get allChildNodes() {
    return new PseudoCollection(
      "allChildNodes",
      this,
      this.childNodes.contents.flatMap(n => [n, ...n.allChildNodes.contents]),
    );
  }

  /**
   * The construction nodes for which this is the parent.
   * @returns {PseudoCollection<ConstructionNode>}
   */
  get childNodes() {
    return new PseudoCollection("childNodes", this, this.collection.filter(n => n.parentNode === this));
  }

  /**
   * A dotted header string.
   * @returns {string}
   */
  get header() {
    if (!this.parentNode) { return `${this.siblingNumber}`; }
    return `${this.parentNode.header}.${this.siblingNumber}`;
  }

  /**
   * The node that is a parent of this one.
   * @returns {ConstructionNode|null}
   */
  get parentNode() {
    return this.collection?.get(this.parentId) ?? null;
  }

  /**
   * The index this lies at among its siblings.
   * @returns {number}
   */
  get siblingNumber() {
    const siblings = this.collection.filter(n => n.parentNode === this.parentNode);
    let n = 1;
    for (const s of siblings) {
      if (s === this) { return n; }
      n++;
    }
    return n;
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    return super._makeFormGroup(path, { ...groupConfig, hint: "" }, inputConfig, config);
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
      foundry.utils.mergeObject(d, this.data, { inplace: true });
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
  async getEditor(config) {
    const editor = await super.getEditor(config);
    const childEditorElements = await Promise.all(this.childNodes.map(c => c.getEditor(config)));
    const html = await TeriockTextEditor.renderTemplate("teriock/ui/construction-node", {
      childEditors: childEditorElements.map(() => ""),
      collapsibleId: `construction-node-${toId(this.uuid, { hash: true })}`,
      formEditor: "",
      node: this,
      parentUuid: this.parent.uuid,
    });
    const container = foundry.utils.parseHTML(html);
    container.querySelector(".construction-node-editor")?.replaceChildren(editor);
    const listItemElements = container.querySelectorAll(".construction-node-list-item");
    childEditorElements.forEach((childEditor, i) => listItemElements[i]?.replaceChildren(childEditor));
    return container;
  }
}
