import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";
import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { tradecraftsField } from "../../../fields/tools/builders.mjs";
import { TradecraftActivation } from "../../activations/command-activations.mjs";
import { OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import { ThresholdAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes TriggerAutomation
 * @mixes OverrideCompetenceMechanic
 */
export default class TradecraftAutomation
  extends mixClasses(ThresholdAutomation, TriggerAutomationMixin, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Tradecraft"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "tradecraft" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      all: new fields.BooleanField({ initial: false }),
      automatic: new fields.BooleanField({ initial: true }),
      multi: new fields.BooleanField(),
      tradecrafts: tradecraftsField(),
    });
  }

  /** @type {Teriock.Keys.Tradecraft[]|null} */
  #chosen = null;

  /** @inheritDoc */
  get _formPaths() {
    return [
      "tradecrafts",
      "hr",
      ...this._selectionPaths,
      "hr",
      ...this._triggerDisplayPaths,
      "hr",
      "bonus",
      "threshold",
      ...this._competencePaths,
    ];
  }

  /**
   * Paths relating to how tradecrafts get selected.
   * @returns {string[]}
   */
  get _selectionPaths() {
    const paths = ["multi"];
    if (this.multi) { paths.push("all"); }
    if (!this.multi || !this.all) { paths.push("automatic"); }
    return paths;
  }

  /** @inheritDoc */
  get makesOneActivation() {
    return false;
  }

  /**
   * Select one or more configured tradecrafts.
   * @returns {Promise<Teriock.Keys.Tradecraft[]>}
   */
  async _choose() {
    const choices = Array.from(this.tradecrafts).filter(Boolean);
    const documents = await DocumentSelector.selectFromConfig({
      auto: this.automatic,
      globalIdentifiers: choices.map(c => `tradecraft:${c}`),
      multi: this.multi,
    }, { title: _loc("TERIOCK.DIALOGS.Select.Name.title", { name: TERIOCK.config.document.tradecraft.label }) });
    return documents.map(d => d.system.identifier);
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selected = this.#chosen ?? Array.from(this.tradecrafts).filter(Boolean);
    if (!selected.length) { return []; }
    const rollData = options.execution?.getRollData?.() ?? options.rollData ?? {};
    const threshold = await this.getThreshold(rollData);
    return selected.map(tradecraft =>
      new TradecraftActivation({
        display: this.getDisplayData(threshold),
        options: { bonus: this.bonus, competence: this.getCompetence(options), threshold, tradecraft },
      })
    );
  }

  /** @inheritDoc */
  async interactOnExecutionInput() {
    this.#chosen = this.interactInExecution ? await this._choose() : null;
  }
}
