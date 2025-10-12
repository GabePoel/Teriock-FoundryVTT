//noinspection JSUnusedGlobalSymbols

import InteractionHandler from "../interaction-handler.mjs";

/**
 * Handler for calling commands when typing in chat messages.
 */
export default class CommandHandler extends InteractionHandler {
  /**
   * Name of command to execute.
   * @type {string}
   */
  static COMMAND = "";

  /**
   * Flags for this command.
   * @type {Record<string, string[]>}
   */
  static FLAGS = {
    advantage: ["--advantage", "-a"],
    crit: ["--crit", "-c"],
    disadvantage: ["--disadvantage", "-d"],
    targets: ["--targets", "-t"],
  };

  /**
   * @param {string} expression
   */
  constructor(expression) {
    super();
    this.advantage = false;
    this.disadvantage = false;
    this.terms = expression.split(" ");
    for (const advantageTerm of this.constructor.FLAGS.advantage) {
      if (this.terms.includes(advantageTerm)) {
        this.advantage = true;
      }
    }
    for (const disadvantageTerm of this.constructor.FLAGS.disadvantage) {
      if (this.terms.includes(disadvantageTerm)) {
        this.disadvantage = true;
      }
    }
    for (const critTerm of this.constructor.FLAGS.crit) {
      if (this.terms.includes(critTerm)) {
        this.disadvantage = true;
      }
    }
    for (const targetsTerm of this.constructor.FLAGS.targets) {
      if (this.terms.includes(targetsTerm)) {
        this.actors = this.targetedActors;
      }
    }
    this.fullExpression = expression;
    this.expression = expression;
    for (const advantageTerm of this.constructor.FLAGS.advantage) {
      this.expression.replace(advantageTerm, "").trim();
    }
    for (const disadvantageTerm of this.constructor.FLAGS.disadvantage) {
      this.expression.replace(disadvantageTerm, "").trim();
    }
    for (const critTerm of this.constructor.FLAGS.crit) {
      this.expression.replace(critTerm, "").trim();
    }
    for (const targetsTerm of this.constructor.FLAGS.targets) {
      this.expression.replace(targetsTerm, "").trim();
    }
  }

  /**
   * Execution command.
   * @returns {Promise<void>}
   */
  async execute() {}
}
