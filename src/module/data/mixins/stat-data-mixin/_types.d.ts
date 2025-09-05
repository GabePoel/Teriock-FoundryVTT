import type StatDieModel from "../../models/stat-die-model/stat-die-model.mjs";

type BaseDice = {
  faces: number;
  number: number;
};

export interface StatDataMixinInterface {
  /** Add this HP to parent {@link TeriockActor}. */
  applyHp: boolean;
  /** Add this MP to parent {@link TeriockActor}. */
  applyMp: boolean;
  /** Base HP dice */
  hpDiceBase: BaseDice;
  /** Base MP dice */
  mpDiceBase: BaseDice;
  /** HP Dice */
  hpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
  /** MP Dice */
  mpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;

  /**
   * Base HP dice formula.
   * @returns The formula string for base HP dice
   */
  get hpDiceBaseFormula(): string;

  /**
   * Faces of HP dice.
   * @returns The number of faces on HP dice
   */
  get hpDiceFaces(): Teriock.RollOptions.PolyhedralDieFaces;

  /**
   * HP dice formula.
   * @returns The formula string for HP dice
   */
  get hpDiceFormula(): string;

  /**
   * Number of HP dice.
   * @returns The total number of HP dice
   */
  get hpDiceNumber(): number;

  /**
   * Base MP dice formula.
   * @returns The formula string for base MP dice
   */
  get mpDiceBaseFormula(): string;

  /**
   * Faces of MP dice.
   * @returns The number of faces on MP dice
   */
  get mpDiceFaces(): Teriock.RollOptions.PolyhedralDieFaces;

  /**
   * MP dice formula.
   * @returns The formula string for MP dice
   */
  get mpDiceFormula(): string;

  /**
   * Number of MP dice.
   * @returns The total number of MP dice
   */
  get mpDiceNumber(): number;

  /**
   * Render all hit dice as one box HTML element.
   * @returns HTML string representation of all hit dice
   */
  get renderedHitDice(): string;

  /**
   * Render all mana dice as one box HTML element.
   * @returns HTML string representation of all mana dice
   */
  get renderedManaDice(): string;

  /**
   * Total HP provided by all stat dice.
   * @returns The sum of all HP dice values
   */
  get totalHp(): number;

  /**
   * Total MP provided by all stat dice.
   * @returns The sum of all MP dice values
   */
  get totalMp(): number;

  /**
   * Set the stat dice.
   * @param changeData - Data to mutate.
   * @param stat - The stat type (hp or mp)
   * @param number - Number of dice
   * @param faces - Number of faces on each die
   */
  _setDice(
    changeData: object,
    stat: Teriock.Parameters.Shared.DieStat,
    number: number,
    faces: Teriock.RollOptions.PolyhedralDieFaces,
  ): void;

  /**
   * Set the stat dice.
   * @param stat - The stat type (hp or mp)
   * @param number - Number of dice
   * @param faces - Number of faces on each die
   */
  setDice(
    stat: Teriock.Parameters.Shared.DieStat,
    number: number,
    faces: Teriock.RollOptions.PolyhedralDieFaces,
  ): void;
}
