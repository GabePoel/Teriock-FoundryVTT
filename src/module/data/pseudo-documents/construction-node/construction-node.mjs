import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { formulaExists } from "../../../helpers/formula.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { toId } from "../../../helpers/string.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { BasePseudoDocument } from "../abstract/_module.mjs";
import { PseudoCollection } from "../collections/_module.mjs";
import {
  OverrideCompetencePseudoDocumentMixin,
  OverrideDataPseudoDocumentMixin,
  SelectionPseudoDocumentMixin,
} from "../mixins/_module.mjs";

/**
 * @import {  DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * @typedef {Teriock.System.TriggerScope} ConstructionScope
 * @property {object} data
 */

const { fields } = foundry.data;

/**
 * @mixes SelectionPseudoDocument
 * @mixes OverrideCompetencePseudoDocument
 * @mixes OverrideDataPseudoDocument
 */
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
      {
        name: new fields.StringField({ placeholder: _loc(this.typeLabel) }),
        parentId: new fields.DocumentIdField({ initial: null, nullable: true, readonly: false }),
      },
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
    return ["name", ...this._selectionPaths, "hr", ...this._competencePaths, "hr", ...this._overrideDataPaths, "hr"];
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
    return new PseudoCollection("childNodes", this, this.collection.filter(n => n.parentId === this._id));
  }

  /**
   * A full name for this.
   * @returns {string}
   */
  get fullName() {
    return _loc("TERIOCK.AUTOMATIONS.AddDocuments.NAME", { header: this.header, name: this.name });
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
   * @param {Partial<ConstructionScope>} [scope]
   * @returns {Promise<object>}
   */
  async constructDocuments(scope = {}) {
    const overrides = { relativeTo: scope.execution?.actor ?? scope.actor ?? this._selectionRelativeTo };
    const data = (await this.selectDocuments(overrides)).map(d => d.toObject());
    if (!data.length) { data.push({}); }
    for (const d of data) {
      specialMerge(d, this.data);
      if (scope.data) { specialMerge(d, scope.data); }
      d.children ??= [];
      foundry.utils.setProperty(d, "system.competence.raw", this.getCompetence(scope));
      for (const n of this.childNodes.contents) {
        const children = await n.constructDocuments(overrides);
        d.children.push(...children);
      }
    }
    return data;
  }

  /**
   * Get operations for adding children to some target Document.
   * @param {TeriockDocument[]} targets
   * @param {Partial<ConstructionScope>} scope
   * @returns {Promise<(Partial<DatabaseWriteOperation>)[]>}
   */
  async getAddChildrenOperations(targets, scope = {}) {
    const record = await this.getDocumentRecord(scope);
    const operations = [];
    targets.forEach(t => {
      Object.entries(record).forEach(([k, v]) => operations.push(t.getCreateChildDocumentsOperation(k, v)));
    });
    return operations;
  }

  /** @inheritDoc */
  getCompetence(scope = {}) {
    if (this.setCompetence === "inherit" && this.parentNode) { return this.parentNode.getCompetence(scope); }
    return super.getCompetence(scope);
  }

  /**
   * Get a deterministic copy of this by applying all selections.
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<ConstructionNode>}
   */
  async getDeterministicCopy(scope = {}) {
    const documents = await this.selectDocuments({
      relativeTo: scope.execution?.actor ?? scope.actor ?? this._selectionRelativeTo,
    });
    return this.clone({
      all: true,
      auto: true,
      globalIdentifiers: [],
      globalUuids: documents.map(d => d.uuid),
      localIdentifiers: [],
      localQualifier: "",
      localUuids: [],
    });
  }

  /**
   * Get a record of documents by their `documentName`.
   * @param {Partial<ConstructionScope>} scope
   * @returns {Promise<Record<Teriock.Documents.DocumentName, object[]>>}
   */
  async getDocumentRecord(scope = {}) {
    const documentNames = ["ActiveEffect", "Actor", "Item"];
    const Classes = documentNames.map(dn => foundry.utils.getDocumentClass(dn));
    const record = Object.fromEntries(documentNames.map(dn => [dn, []]));
    const constructed = await this.constructDocuments(scope);
    for (const c of constructed) {
      for (const Cls of Classes) {
        if (Cls.implementation.TYPES.includes(c?.type)) {
          record[Cls.documentName].push(c);
          break;
        }
      }
    }
    return record;
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

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    if (!this.name) {
      let name = _loc(this.constructor.typeLabel);
      if (
        this.globalIdentifiers.size + this.globalUuids.size + this.localIdentifiers.size + this.localUuids.size
          === 1 && !formulaExists(this.localQualifier)
      ) {
        if (this.globalIdentifiers.size) {
          name = teriock.fromIdentifierSync(this.globalIdentifiers.first())?.name ?? name;
        }
        if (this.globalUuids.size) { name = fromUuidSync(this.globalIdentifiers.first())?.name ?? name; }
        if (this.localUuids.size && this.actor) {
          name = fromUuidSync(this.localUuids.first(), { relative: this.actor })?.name ?? name;
        }
        // TODO: Think of something for `localIdentifiers`.
      }
      this.name = this.data.name ? BaseRoll.replaceFormulaData(this.data.name, { base: name }) : name;
    }
    this.img = this.data.img ?? systemPath("icons/documents/uncertainty.svg");
  }
}

/**
 * Merge two objects.
 * @param {object} a
 * @param {object} b
 * @returns {object}
 */
function specialMerge(a, b) {
  let name;
  if (b.name) { name = BaseRoll.replaceFormulaData(b.name, { base: a.name ?? "" }); }
  foundry.utils.mergeObject(a, b, { inplace: true });
  if (name) { a.name = name; }
  return a;
}
