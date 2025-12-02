declare module "./child-type-model" {
  export default interface ChildTypeModelInterface {
    /** <schema> Description */
    description: string;
    /** <schema> If this is forced to be fluent */
    fluent: boolean;
    /** <schema> Font */
    font: Teriock.Parameters.Shared.Font;
    /** <schema> If this is forced to be proficient */
    proficient: boolean;
    /** <schema> <base> Qualifier formulas which are resolved before changes are applied */
    qualifiers: {
      ephemeral: Teriock.Fields.ModifiableDeterministic;
      suppressed: Teriock.Fields.ModifiableDeterministic;
    };

    get parent(): TeriockChild;
  }
}

export {};
