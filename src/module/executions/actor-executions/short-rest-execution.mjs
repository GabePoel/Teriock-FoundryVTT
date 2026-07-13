import { UseDocumentsAutomation } from "../../data/pseudo-documents/automations/_module.mjs";
import { TypeCollection } from "../../documents/collections/_module.mjs";
import { toId, toKebabCase } from "../../helpers/string.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} useAbilities
 */
export default class ShortRestExecution extends DocumentExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.ShortRest"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { useAbilities: new fields.BooleanField({ initial: true }) });
  }

  /**
   * @param {object} [data]
   * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    this._automations = [
      new UseDocumentsAutomation({
        _id: toId(UseDocumentsAutomation.TYPE, { hash: true }),
        automatic: false,
        local: { qualifier: `and(@ability, @time.${this.executionTime})` },
        trigger: "execute",
        type: "useDocuments",
      }, { parent: this.source.system }),
    ];
  }

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: this.icon,
      label: `TERIOCK.DIALOGS.${this.executionTime.capitalize()}.BUTTONS.take${this.executionTime.capitalize()}`,
      name: `take${this.executionTime.capitalize()}`,
    }];
  }

  /** @inheritDoc */
  get _formPaths() {
    return this._hasAbilities ? ["useAbilities"] : [];
  }

  /**
   * Whether this actor has abilities with a short rest execution time.
   * @returns {boolean}
   */
  get _hasAbilities() {
    return this.actor?.abilities.some(a => {
      const time = a.system.executionTime;
      return time?.base === this.executionTime || time?.slow?.unit === this.executionTime;
    }) ?? false;
  }

  /** @inheritDoc */
  get automations() {
    if (!this.useAbilities) { return new TypeCollection([]); }
    return super.automations;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.journalEntryPage?.uuid } });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, this.executionTime.capitalize()];
  }

  /**
   * The execution of the hook call trigger event this corresponds to.
   * @returns {string}
   */
  get executionTime() {
    return "shortRest";
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.ui[this.executionTime];
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return `core:${toKebabCase(this.executionTime)}`;
  }

  /** @inheritDoc */
  get name() {
    return _loc(`TERIOCK.DIALOGS.${this.executionTime.capitalize()}.title`);
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [Object.assign(await this.journalEntryPage.toPanel(), { icon: this.icon })];
  }

  /** @inheritDoc */
  async _postExecute() {
    // Rests get a standalone hook call so that it can be invoked without an execution by the GM.
    this.actor?.hookCall(this.executionTime, { scope: this.getScope() });
    return super._postExecute();
  }
}
