import { ConstructionNode } from "../../_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class ConstructDocumentsAutomation extends mixClasses(BaseAutomation, CritMechanicMixin) {
  /** @inheritDoc */
  static get LABEL() {
    return "Construct Documents";
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { pseudos: { ConstructionNode: "constructionNodes" } });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { constructionNodes: new PseudoCollectionField(ConstructionNode) });
  }
}
