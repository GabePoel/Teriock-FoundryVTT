import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { parseIdentifier } from "../../../helpers/utils.mjs";
import { BaseExecution } from "../../abstract/_module.mjs";

/**
 * Rolling one of an actor's affinities. Everything it displays comes from the affinity's own configuration, so it
 * works for any type. When the roll came from a specific affinity, that affinity supplies the image and wrappers.
 * @extends {BaseExecution}
 * @property {FakeAffinityModel | null} affinity
 * @property {Teriock.Affinities.Type} type
 * @property {string[]} wrappers
 */
export default class AffinityExecution extends BaseExecution {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.AffinityExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    this.type = options.type ?? "immunity";
    this.affinity = options.affinity ?? null;
    this.wrappers = options.wrappers
      ?? [this.affinity?.typeLabel, this.affinity?.categoryLabel, this.affinity?.name].filter(Boolean);
    this.wrappers.push(
      TERIOCK.config.affinity.types[this.type]?.hex
        ? _loc("TERIOCK.TERMS.Common.chosen")
        : _loc("TERIOCK.TERMS.Common.automatic"),
    );
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments;
    if (this.affinity) { docs.unshift({ document: this.affinity, label: this.name }); }
    return docs;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.journalEntryPage?.uuid } });
  }

  /** @inheritDoc */
  get flavor() {
    return this.name;
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.pseudoDocument.affinity;
  }

  /**
   * Prefers the image of the specific affinity rolled, falling back to the one for its type.
   * @returns {string}
   */
  get img() {
    if (this.affinity?.img) { return this.affinity.img; }
    return getImage(
      TERIOCK.config.affinity.types[this.type]?.imgCategory,
      parseIdentifier(TERIOCK.config.affinity.types[this.type]?.identifier).identifier,
    );
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return TERIOCK.config.affinity.types[this.type]?.identifier;
  }

  /** @inheritDoc */
  get name() {
    return _loc(TERIOCK.config.affinity.types[this.type]?.label ?? "");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push({
      bars: [{ icon: this.icon, label: this.name, wrappers: this.wrappers }],
      blocks: [{ text: this.journalEntryPage?.text?.content, title: this.name }],
      icon: this.icon,
      image: this.img,
      label: _loc("TERIOCK.AFFINITIES.Base.LABEL"),
      name: this.name,
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
