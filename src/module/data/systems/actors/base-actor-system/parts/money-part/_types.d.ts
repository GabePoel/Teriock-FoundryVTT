declare global {
  namespace Teriock.Models {
    export type ActorMoneyPartData = {
      /** <schema> Interest rate */
      interestRate: number;
      /** <schema> Money */
      money: Record<Teriock.Keys.Currency, number> & {
        /** <schema> Debt */
        debt: number;
        /** <schema> Total non-debt money in gold */
        physical: number;
        /** <schema> Total money in gold */
        total: number;
      };
    };
  }
}

export {};
