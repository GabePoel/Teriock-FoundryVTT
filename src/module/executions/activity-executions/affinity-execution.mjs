import { BaseExecution } from "../abstract/_module.mjs";

/**
 * Rolling one of an actor's affinities. Everything it displays comes from the affinity's own configuration, so it
 * works for any type. When the roll came from a specific affinity, that affinity supplies the image and wrappers.
 * @extends {BaseExecution}
 * @property {VirtualAffinityModel | null} affinity
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
      TERIOCK.config.affinity.types[this.type]?.hex ? _loc("TERIOCK.COMMON.Chosen") : _loc("TERIOCK.COMMON.Automatic"),
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
    return this.affinity?.img ?? TERIOCK.config.affinity.types[this.type]?.img;
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
      _id: this.journalEntryPage?.id,
      bars: [{ icon: this.icon, label: this.name, wrappers: this.wrappers }],
      blocks: [{ text: this.journalEntryPage?.text?.content, title: this.name }],
      color: foundry.utils.Color.from(TERIOCK.config.affinity.types[this.type]?.color),
      icon: this.icon,
      img: this.img,
      label: _loc("TERIOCK.AFFINITIES.Base.LABEL"),
      name: this.name,
      uuid: this.journalEntryPage?.uuid,
    });
  }
}
