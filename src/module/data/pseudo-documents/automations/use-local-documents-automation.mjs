import { mix } from "../../../helpers/utils.mjs";
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

  /**
   * Parse this automation's identifiers.
   * @return {{type: string|null, identifier: string}[]}
   */
  #parseIdentifiers() {
    return Array.from(this.identifiers).map((i) => {
      let type = null;
      let identifier = i;
      if (i.includes(":")) {
        const parts = i.split(":");
        type = parts[0];
        identifier = parts[1];
      }
      return {
        type,
        identifier,
      };
    });
  }

  /** @inheritDoc */
  async _getActivations() {
    return this.#parseIdentifiers().map(
      (p) =>
        new UseLocalActivation({
          options: {
            lookup: p.identifier,
            type: p.type,
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
    const out = await Promise.all(
      this.#parseIdentifiers().map((p) =>
        (options.actor || this.actor)?.getDocument(p.identifier, p.type),
      ),
    );
    return out.filter((d) => d && typeof d.use === "function");
  }
}
