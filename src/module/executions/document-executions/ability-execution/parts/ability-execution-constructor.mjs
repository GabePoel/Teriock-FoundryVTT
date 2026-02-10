import { ThresholdExecutionMixin } from "../../../mixins/_module.mjs";
import BaseDocumentExecution from "../../base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 */
export default class AbilityExecutionConstructor extends ThresholdExecutionMixin(
  BaseDocumentExecution,
) {
  /**
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  constructor(
    options = /** @type {Teriock.Execution.AbilityExecutionOptions} */ {},
  ) {
    super(options);
    /** @type {TeriockArmament|null} */
    let defaultArmament = null;
    if (this.actor && this.source.system.interaction === "attack") {
      defaultArmament = this.actor.system.primaryAttacker;
    } else if (this.actor && this.source.system.interaction === "block") {
      defaultArmament = this.actor.system.primaryBlocker;
    }
    let {
      armament = defaultArmament,
      noHeighten = false,
      noTemplate = false,
      warded = this.source.system.warded,
      piercing = /** @type {PiercingModel} */ this.source.system.piercing.clone(),
      sb = this.actor?.system.offense.sb || 0,
      attackPenalty = "0",
      vitals = this.source.system.targets.has("vitals"),
    } = options;
    this.armament = armament;
    if (this.armament && this.source.system.isContact) {
      if (
        options.warded === undefined &&
        this.armament.system.warded &&
        ["attack", "block"].includes(this.source.system.interaction)
      ) {
        warded = true;
      }
      piercing.raw = Math.max(
        piercing.raw,
        this.armament.system.piercing.raw,
        this.actor?.system.offense.piercing.raw,
      );
      if (
        options.vitals === undefined &&
        this.source.system.interaction === "attack" &&
        this.armament.system.vitals
      ) {
        vitals = true;
      }
    }
    if (options.attackPenalty === undefined) {
      if (this.source.system.interaction === "attack") {
        if (this.source.system.isContact && this.armament) {
          attackPenalty = this.armament.system.attackPenalty.formula;
        } else {
          attackPenalty = "-3";
        }
      }
    }
    this.flags = {
      noHeighten: noHeighten,
      noTemplate: noTemplate,
    };
    this.warded = warded;
    if (this.actor) {
      this.executor = this.actor.defaultToken;
    }
    this.costs = {
      hp: 0,
      mp: 0,
      gp: 0,
    };
    this.sb = sb;
    this.piercing = piercing;
    this.attackPenaltyFormula = attackPenalty;
    this.attackPenalty = 0;
    this.vitals = vitals;
    this.targets = new Set();
  }

  /** @inheritDoc */
  get _macroExecutionScope() {
    return {
      ...super._macroExecutionScope,
      ability: this.source,
    };
  }

  /**
   * @inheritDoc
   * @returns {BaseAutomation[]}
   */
  get activeAutomations() {
    const automations = /** @type {BaseAutomation[]} */ super.activeAutomations;
    return automations.filter(
      (a) =>
        (a.heighten.has(0) && !this.heightened) ||
        (a.heighten.has(1) && this.heightened),
    );
  }

  /**
   * @inheritDoc
   * @returns {TeriockAbility}
   */
  get source() {
    return super.source;
  }

  /**
   * Replace `@h` with the heighten amount in strings.
   * @param {string} s
   * @returns {string}
   */
  _heightenString(s) {
    const regex = /@h(?![a-zA-Z])/g;
    if (regex.test(s)) {
      return s.replace(regex, (this.heightened || 0).toString());
    } else {
      return s;
    }
  }
}
