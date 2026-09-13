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
   * @inheritdoc
   * Existing entries are retained, but new source data is used.
   * @param {DataModel} model - The parent data model that holds this collection.
   * @param {object} [options]
   */
  initialize(model, options = {}) {
    this.model = model;
    const ids = new Set();
    for (const data of Object.values(this._source)) {
      let pseudo = this.get(data?._id);
      if (pseudo?._source === data) { pseudo._initialize(options); }
      else {
        pseudo = this.field.element.initialize(data, model, options);
        if (!(pseudo instanceof BasePseudoDocument)) { continue; }
        this.set(pseudo.id, pseudo);
      }
      ids.add(pseudo.id);
    }
    if (this.size !== ids.size) {
      for (const id of [...this.keys()]) { if (!ids.has(id)) { this.delete(id); } }
    }
  }
}
