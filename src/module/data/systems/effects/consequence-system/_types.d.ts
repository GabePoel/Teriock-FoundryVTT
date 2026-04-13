declare global {
  namespace Teriock.Models {
    export type ConsequenceSystemData = {
      /** <schema> Associations */
      associations: Teriock.Messages.MessageAssociation[];

      get parent(): TeriockConsequence;
    };
  }
}

export {};
