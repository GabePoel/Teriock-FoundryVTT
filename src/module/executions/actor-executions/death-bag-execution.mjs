import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { deathBagSchema } from "../../data/fields/tools/builders.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { getImage } from "../../helpers/path.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";

/**
 * @property {Record<Teriock.Keys.DeathBagStoneColor, Teriock.System.FormulaString>} stones
 * @property {Teriock.System.FormulaString} pull
 */
export default class DeathBagExecution extends DocumentExecution {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), deathBagSchema());
  }

  /**
   * @param {object} [data]
   * @param {Partial<Teriock.Execution.ExecutionOptions>} [options]
   */
  constructor(data = {}, options = {}) {
    const actor = options.actor ?? options.source?.actor ?? game.actors.default;
    data.pull ??= actor?.system.deathBag.pull ?? "10";
    data.stones ??= Object.fromEntries(
      Object.keys(TERIOCK.config.die.deathBagStoneColor).map(
        color => [color, actor?.system.deathBag.stones[color] ?? "0"]
      ),
    );
    super(data, options);
    const defaultMessageMode = game.settings.get("teriock", "deathBagMessageMode");
    if (defaultMessageMode) {
      this._messageMode = options.messageMode ?? defaultMessageMode;
    }
  }

  /** @type {string} */
  content = "";

  /** @type {number} */
  pulledCount = 0;

  /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
  pulledStones;

  /** @type {number} */
  toPullCount = 0;

  /** @type {string[]} */
  wrappers = [];

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.ui.deathBag,
      label: "TERIOCK.DIALOGS.DeathBag.BUTTONS.makePull",
      name: "makePull",
    }];
  }

  /**
   * @inheritDoc
   * @remarks Intentionally does not include parent paths.
   */
  get _formPaths() {
    return ["pull", ...game.settings.get("teriock", "deathBagStoneColors").map(color => `stones.${color}`)];
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      content: this.content,
      system: { _src: this.journalEntryPage?.uuid },
    });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "DeathBag"];
  }

  /**
   * An icon for this execution to show in dialogs.
   * @returns {string}
   */
  get icon() {
    return TERIOCK.display.icons.ui.deathBag;
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return "core:death-bag";
  }

  /**
   * A name for this execution to show in dialogs.
   * @returns {string}
   */
  get name() {
    return _loc("TERIOCK.DIALOGS.DeathBag.title");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [];
    let outcome = "";
    switch (this.pulledStones.black ?? 0) {
      case 1:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome1");
        break;
      case 2:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome2");
        break;
      case 3:
        outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome3");
        break;
      default:
        break;
    }
    /** @type {Teriock.Panels.PanelParts} */
    const resultPanel = {
      bars: [{
        icon: TERIOCK.config.document.stone.icon,
        label: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.initialStonesInBag"),
        wrappers: this.wrappers,
      }],
      blocks: [{
        italic: true,
        text: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.descriptionText"),
        title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.description"),
      }, { text: outcome, title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome") }],
      icon: TERIOCK.display.icons.ui.deathBag,
      image: getImage("misc", "Death Bag"),
      name: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.name"),
    };
    this.panels.push(await TeriockTextEditor.enrichPanel(resultPanel));
  }

  /** @inheritDoc */
  async _buildRolls() {
    const rollData = this.getRollData();
    this.toPullCount = Math.floor(Math.max(await BaseRoll.getValue(this.pull, rollData), 0));
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    const startingStones = {};
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    const pulledStones = {};
    /** @type {Teriock.Keys.DeathBagStoneColor[]} */
    const bag = [];
    let totalStonesCount = 0;
    this.wrappers = [];
    for (const color of game.settings.get("teriock", "deathBagStoneColors")) {
      startingStones[color] = Math.floor(Math.max(await BaseRoll.getValue(this.stones[color], rollData), 0));
      totalStonesCount += startingStones[color];
      pulledStones[color] = 0;
      this.wrappers.push(`${startingStones[color]} ${TERIOCK.reference.deathBag[color]}`);
    }
    if (totalStonesCount > 99) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.maxStones", {
        format: { count: totalStonesCount },
        localize: true,
      });
      return false;
    }
    for (const color of Object.keys(startingStones)) {
      for (let i = 0; i < startingStones[color]; i++) { bag.push(color); }
    }
    this.wrappers.push(_loc("TERIOCK.DIALOGS.DeathBag.PANEL.total", { count: bag.length }));
    if (bag.length < this.toPullCount) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.cannotPull", {
        format: { bagCount: bag.length, toPullCount: this.toPullCount },
        localize: true,
      });
      return false;
    }
    this.pulledCount = 0;
    while (this.pulledCount < this.toPullCount) {
      this.pulledCount++;
      const roll = new BaseRoll(`1d${bag.length}`, {});
      await roll.evaluate();
      const pulledColor = bag.splice(roll.total - 1, 1)[0];
      pulledStones[pulledColor] = pulledStones[pulledColor] + 1;
    }
    this.pulledStones = pulledStones;
    this.content = await TeriockTextEditor.renderTemplate("teriock/ui/death-bag", {
      pulledCount: this.pulledCount,
      pulledStones: this.pulledStones,
    });
  }

  /** @inheritDoc */
  async _buildTags() {
    this.tags.push(_loc("TERIOCK.DIALOGS.DeathBag.PANEL.pulledStonesTag", { count: this.toPullCount }));
  }
}
