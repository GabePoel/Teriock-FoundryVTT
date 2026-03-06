declare global {
  namespace Teriock.Models {
    export type RulesSystemInterface = {
      /** A kebab-case string that uniquely identifies this rules element amongst its type. */
      identifier: string;

      get parent(): AnyRules;
    };
  }
}

export {};
