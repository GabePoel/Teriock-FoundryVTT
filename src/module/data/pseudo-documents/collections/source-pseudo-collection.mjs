import BasePseudoDocument from "../abstract/base-pseudo-document/base-pseudo-document.mjs";
import PseudoCollection from "./pseudo-collection.mjs";

/**
 * @import { DataModel } from "@common/abstract/_module.mjs";
 */

/**
 * A PseudoCollection that holds the `_source` data that's actually saved in the database.
 * @template {{ type: string }} TPseudo
 * @extends {PseudoCollection<TPseudo>}
 */
export default class SourcePseudoCollection extends PseudoCollection {
  /**
   * @inheritDoc
   * @param {Record<ID<TPseudo>, object>} [options.source] - The source data this fronts.
   */
  constructor(name, parent, sourceArray = [], options = {}) {
    super(name, parent, sourceArray, options);
    Object.defineProperty(this, "_source", { configurable: false, value: options.source ?? {}, writable: false });
  }

  /** @type {Record<ID<TPseudo>, object>} */
  _source;

  /**
   * Existing entries are retained, but new source data is used.
   * @inheritDoc
   * @param {DataModel} model - The parent data model that holds this collection.
   * @param {object} [options]
   */
  initialize(model, options = {}) {
    this.model = model;
    const pseudos = [];
    for (const data of Object.values(this._source).sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))) {
      let pseudo = this.get(data?._id);
      if (pseudo?._source === data) { pseudo._initialize(options); }
      else {
        pseudo = this.field.element.initialize(data, model, options);
        if (!(pseudo instanceof BasePseudoDocument)) { continue; }
      }
      pseudos.push(pseudo);
    }
    const keys = this.keys();
    if (pseudos.length === this.size && pseudos.every(p => keys.next().value === p.id)) { return; }
    this.clear();
    for (const pseudo of pseudos) { this.set(pseudo.id, pseudo); }
  }
}
