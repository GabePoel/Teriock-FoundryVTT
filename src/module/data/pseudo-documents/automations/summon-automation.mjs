import { mixClasses } from "../../../helpers/construction.mjs";
import { resolveDocument } from "../../../helpers/resolve.mjs";
import { SummonActivation } from "../activations/_module.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes SelectExternalDocumentsAutomation
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 * @property {boolean} merge
 */
export default class SummonAutomation
  extends mixClasses(
    BaseAutomation,
    CritMechanicMixin,
    automationMixins.SelectExternalDocumentsAutomationMixin,
    automationMixins.DisplayAutomationMixin,
    automationMixins.TriggerAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Summon"];

  /** @inheritdoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Summon.LABEL";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionTriggers: ["execute"] });
  }

  /** @inheritdoc */
  static get TYPE() {
    return "summon";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { merge: new fields.BooleanField({ initial: true }) });
  }

  /**
   * @param {UUID<TeriockDocument>} uuid
   * @returns {boolean}
   */
  #validateUuid(uuid) {
    const parsed = foundry.utils.parseUuid(uuid);
    return parsed?.type === "Actor";
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...this._selectionPaths, "hr", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  get _selectionPaths() {
    const paths = super._selectionPaths;
    if (!this.trigger) { paths.push("merge"); }
    return paths;
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const uuids = (await this.choose(options)).filter(this.#validateUuid);
    if (!uuids.length) { return []; }
    if (this.merge) { return [new SummonActivation({ display: this.display, uuids })]; }
    const activations = [];
    for (const uuid of uuids) {
      const doc = await resolveDocument(uuid);
      const label = _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.placeNamed", {
        name: doc?.name || _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.defaultName"),
      });
      const display = foundry.utils.deepClone(this.display);
      display.label ||= label;
      activations.push(new SummonActivation({ display, uuids: [uuid] }));
    }
    return activations;
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    return (await super.getDocuments(options)).filter(d => d?.documentName === "Actor");
  }
}
