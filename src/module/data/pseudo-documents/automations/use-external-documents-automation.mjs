import { UseExternalHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { mix } from "../../../helpers/utils.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import {
  ExternalDocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} noHeighten
 * @property {boolean} expandTables
 * @extends {BaseAutomation}
 * @mixes ExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes UseDocumentsAutomation
 */
export default class UseExternalDocumentsAutomation extends mix(
  BaseAutomation,
  ExternalDocumentsAutomationMixin,
  UseDocumentsAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.UseExternalDocumentsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.UseExternalDocumentsAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "useExternal";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      expandTables: new fields.BooleanField(),
      noHeighten: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "noHeighten", "expandTables"];
  }

  /**
   * Make a button for a given document.
   * @param {UUID<AnyChildDocument>} uuid
   * @return {Promise<Teriock.UI.HTMLButtonConfig>}
   */
  async #makeButton(uuid) {
    const doc = await resolveDocument(uuid);
    const label = doc.name;
    const icon = TERIOCK.options.document[doc.type]?.icon;
    return UseExternalHandler.buildButton(uuid, {
      competence: this.overrideCompetence
        ? this.competence.raw
        : this.document.system.competence.raw,
      expandTables: this.expandTables,
      icon,
      label,
      noHeighten: this.noHeighten,
    });
  }

  /** @inheritDoc */
  async _getButtons() {
    return Promise.all(
      Array.from(this.documents).map((d) => this.#makeButton(d)),
    );
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    const out = await super.getDocuments(options);
    return out.filter((d) => d && typeof d.use === "function");
  }
}
