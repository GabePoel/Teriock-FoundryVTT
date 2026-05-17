import { localizeChoices } from "../../../helpers/localization.mjs";
import {
  ApplyStatusActivation,
  RemoveStatusActivation,
  ToggleStatusActivation,
} from "../activations/command-activations.mjs";
import { CritAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Condition} status
 * @property {"apply"|"remove"|"toggle"} relation
 */
export default class ChatStatusAutomation extends CritAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChatStatus"];

  /**
   * The available relation options.
   * @type {Record<string, string>}
   */
  static get _relationChoices() {
    return localizeChoices({
      apply: "TERIOCK.AUTOMATIONS.ChatStatus.FIELDS.relation.choices.apply",
      remove: "TERIOCK.AUTOMATIONS.ChatStatus.FIELDS.relation.choices.remove",
      toggle: "TERIOCK.AUTOMATIONS.ChatStatus.FIELDS.relation.choices.toggle",
    });
  }

  /**
   * The initial relation option.
   * @returns {string}
   */
  static get _relationInitial() {
    return "apply";
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChatStatus.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "chatStatus";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      relation: new fields.StringField({
        choices: this._relationChoices,
        initial: this._relationInitial,
        label: "TERIOCK.AUTOMATIONS.Base.FIELDS.relation.label",
        nullable: false,
        required: true,
      }),
      status: new fields.StringField({
        choices: TERIOCK.reference.conditions,
        initial: Object.keys(TERIOCK.reference.conditions)[0],
        label: "TERIOCK.TERMS.Common.condition",
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["status", "relation"];
  }

  /** @inheritDoc */
  async getActivations() {
    if (this.relation === "apply") {
      return [new ApplyStatusActivation({ options: { status: this.status } })];
    } else if (this.relation === "remove") {
      return [new RemoveStatusActivation({ options: { status: this.status } })];
    } else if (this.relation === "toggle") {
      return [new ToggleStatusActivation({ options: { status: this.status } })];
    } else {
      return [];
    }
  }
}
