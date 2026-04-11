import { mix } from "../../../helpers/construction.mjs";
import { fromIdentifierLocal } from "../../../helpers/utils.mjs";
import { IdentifierField } from "../../fields/_module.mjs";
import { UseLocalActivation } from "../activations/command-activations.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  DocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes UseDocumentsAutomation
 * @property {Set<TypedIdentifier|Identifier>} identifiers
 */
export default class UseLocalDocumentsAutomation extends mix(
  BaseAutomation,
  DocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseLocalDocuments",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseLocalDocuments.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useLocal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      identifiers: new fields.SetField(
        new IdentifierField({ allowType: true }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifiers", ...super._formPaths];
  }

  /** @inheritDoc */
  get hasDocuments() {
    return this.identifiers.size > 0;
  }

  /** @inheritDoc */
  async _getActivations() {
    return this.identifiers.map(
      (i) =>
        new UseLocalActivation({
          options: {
            lookup: i,
            noHeighten: this.noHeighten,
            competence: this.overrideCompetence
              ? this.competence.raw
              : this.document.system.competence.raw,
          },
        }),
    );
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    const actor = options.actor || this.actor;
    const out = await Promise.all(
      this.identifiers.map((identifier) =>
        fromIdentifierLocal(identifier, actor),
      ),
    );
    return out.filter((d) => d && typeof d?.use === "function");
  }
}
