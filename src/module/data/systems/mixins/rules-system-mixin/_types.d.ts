declare global {
  namespace Teriock.Models {
    export type RulesSystemData = {
      /** A kebab-case string that uniquely identifies this rules element amongst its type. */
      identifier: Identifier;

      get parent(): AnyRules;
    };
  }
}

export {};
