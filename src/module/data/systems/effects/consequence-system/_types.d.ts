declare global {
  namespace Teriock.Models {
    export type ConsequenceSystemData = {
      /** <schema> Associations */
      associations: Teriock.Panels.PanelAssociation[];

      get parent(): TeriockConsequence;
    };
  }
}

export {};
