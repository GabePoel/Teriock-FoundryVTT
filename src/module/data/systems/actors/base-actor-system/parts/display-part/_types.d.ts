declare global {
  namespace Teriock.Models {
    export type ActorDisplayPartInterface = {
      /** <schema> Notes about the actor */
      notes: string;
      /** <base> HTML strings that get displayed on the sheet */
      sheet: {
        dieBox: {
          hp: string;
          mp: string;
        };
        primaryAttacker: string | null;
        primaryBlocker: string | null;
      };
    };
  }
}

export {};
