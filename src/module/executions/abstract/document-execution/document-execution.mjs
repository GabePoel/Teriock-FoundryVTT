import { prefixObject } from "../../../helpers/utils.mjs";
import BaseExecution from "../base-execution/base-execution.mjs";

const { fields } = foundry.data;

export default class DocumentExecution extends BaseExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Document"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { consumeUses: new fields.BooleanField({ initial: true }) });
  }

  /** @returns {Teriock.Execution.ExecutionDialogButtonEntry[]} */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.manifest.ui.enable,
      label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.use",
      name: "ok",
    }];
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    return [
      { document: this.source, label: _loc(`TYPES.${this.source.documentName}.${this.source.type}`) },
      ...super._dialogDocuments,
    ];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this.source?.system.consumable) { paths.push("consumeUses"); }
    return paths;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.source.uuid } });
  }

  /** @inheritDoc */
  get icon() {
    return this.source.system?.metadata?.icon ?? super.icon;
  }

  /** @inheritDoc */
  get name() {
    return this.source.system.fullName ?? this.source.name;
  }

  /**
   * @inheritDoc
   * @returns {Promise<false|void>}
   */
  async _buildPanels() {
    this.panels.length = 0;
    const panel = await this._buildSourcePanel();
    if (panel) { this.panels.push(panel); }
  }

  /**
   * Makes a panel representing the source document.
   * @returns {Promise<Teriock.Panels.PanelParts|false>}
   */
  async _buildSourcePanel() {
    return this.source.getPanelParts?.() ?? false;
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    this.automations.resetDocuments(this.source.system?.automations?.values?.() ?? []);
    if (this.source.documentName === "Actor") { this.automations.resetDocuments([]); }
    this._boosts = options.boosts ?? this.source.system?.boosts ?? this._boosts;
    if (game.settings.get("teriock", "secretDocuments").has(this.source?.typedIdentifier)) {
      this._messageMode = options.messageMode ?? "blind";
    }
  }

  /**
   * The source's local roll data as seen by this execution.
   * @returns {object}
   */
  _getSourceRollData() {
    return this.source.system?.getLocalRollData?.() ?? {};
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    data.consumeUses ??= options.source?.system?.settings?.getSetting("consumeOnUse");
    return super._initializeSource(data, options);
  }

  /**
   * @inheritDoc
   * @returns {Promise<false|void>}
   */
  async _prepareUpdates() {
    const yes = await super._prepareUpdates();
    if (yes === false) { return false; }

    if (this.source.system?.consumable && this.consumeUses) {
      this.operations.push({
        action: "update",
        documentName: this.source.documentName,
        parent: this.source.parent,
        updates: [{
          _id: this.source.id,
          system: {
            quantity: { value: Math.max(0, this.source.system.quantity.value - this.source.system.consumptionAmount) },
          },
        }],
      });
    }
  }

  /** @inheritDoc */
  _resolveActor(options) {
    return options.actor ?? options.source?.actor ?? game.actors.default;
  }

  /** @inheritDoc */
  async execute() {
    if (!this.source) {
      console.error("Document executions must have a source document.");
      return;
    }
    await super.execute();
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  getRollData() {
    return Object.assign(super.getRollData(), prefixObject(this._getSourceRollData(), "source"));
  }
}
