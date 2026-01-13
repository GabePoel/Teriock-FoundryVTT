export default interface ActorMoneyPartInterface {
  /** <schema> Interest rate */
  interestRate: number;
  /** <schema> Money */
  money: {
    /** <schema> Copper coins */
    copper: number;
    /** <schema> Silver coins */
    silver: number;
    /** <schema> Gold coins */
    gold: number;
    /** <schema> Ent tear amber */
    entTearAmber: number;
    /** <schema> Fire eye rubies */
    fireEyeRuby: number;
    /** <schema> Pixie plum amethysts */
    pixiePlumAmethyst: number;
    /** <schema> Snow diamonds */
    snowDiamond: number;
    /** <schema> Dragon emeralds */
    dragonEmerald: number;
    /** <schema> Moon opals */
    moonOpal: number;
    /** <schema> Magus quartz */
    magusQuartz: number;
    /** <schema> Heartstone rubies */
    heartstoneRuby: number;
    /** <schema> Debt */
    debt: number;
    /** <schema> Total money in gold */
    total: number;
  };
}
