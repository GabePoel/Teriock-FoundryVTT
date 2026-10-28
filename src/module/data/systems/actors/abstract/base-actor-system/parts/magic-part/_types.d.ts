declare global {
  namespace Teriock.Models {
    export interface ActorMagicPartData {
      /** <schema> <base> How many curses the {@link TeriockActor} has */
      curses: Teriock.Fields.BarField;
      /** <schema> Modifiers applied to Elder Sorcery creation */
      elderSorceryCreation: {
        bonuses: {
          assistance: Teriock.System.FormulaString;
          effort: Teriock.System.FormulaString;
          experience: Teriock.System.FormulaString;
          other: Teriock.System.FormulaString;
        };
        penalties: {
          metaphysics: Teriock.System.FormulaString;
          other: Teriock.System.FormulaString;
          strain: Teriock.System.FormulaString;
        };
        ratings: { castingCost: number, creationCost: number, incantation: number, intention: number };
      };
      /** <schema> <base> How many curses the {@link TeriockActor} has prepared */
      rotators: Teriock.Fields.BarField;
    }
  }
}

export {};
