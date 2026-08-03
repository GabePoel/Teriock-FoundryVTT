declare global {
  namespace Teriock.Models {
    export type InstructionsSystemData = {
      /** <schema> GM notes */
      gmNotes: string;
      /** <schema> Setup and usage instructions */
      instructions: string;
    };
  }
}

export {};
