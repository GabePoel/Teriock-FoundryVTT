declare global {
  namespace Teriock.Models {
    export interface IdentifierSystemData {
      /** A kebab-case string that uniquely identifies this rules element amongst its type. */
      identifier: Slug;
    }
  }
}

export {};
