declare global {
  namespace Teriock.Command {
    export type UseOptions = { event?: PointerEvent };

    /**
     * Options for generic threshold rolls.
     */
    export type ThresholdOptions = UseOptions & {
      /** Some bonus to add to the roll */
      bonus?: Teriock.System.FormulaString;
      /** The comparison operation `c(roll, threshold)` */
      comparison?: Teriock.Keys.Comparison;
      /** Proficiency and fluency */
      competence?: Teriock.System.CompetenceLevel;
      /** Positive for advantage, negative for disadvantage */
      edge?: Teriock.System.EdgeLevel;
      /** A formula to use other than the default one */
      formula?: Teriock.System.FormulaString;
      /** Whether to show a roll dialog */
      showDialog?: boolean;
      /** A threshold the roll needs to meet */
      threshold?: number;
    };

    export type TradecraftOptions = ThresholdOptions & { tradecraft?: Teriock.Keys.Tradecraft };

    export type FeatOptions = ThresholdOptions & { attribute?: Teriock.Keys.Attribute };

    export type HackOptions = UseOptions & { part?: Teriock.Keys.HackableBodyPart };

    export type FormulaOptions = UseOptions & { formula?: string };

    export type DealOptions = FormulaOptions & {
      apply?: boolean;
      boost?: boolean;
      boosts?: number;
      crit?: boolean;
      document?: TeriockActiveEffect | TeriockItem;
      command?: Teriock.Keys.Command;
      reverse?: boolean;
      rollData?: object;
    };

    export type StatusOptions = UseOptions & { status?: Teriock.Keys.Condition };

    export type StandardDamageOptions = UseOptions & {
      ammunition?: UUID<TeriockItem<"equipment">>;
      armament?: UUID<TeriockItem<"body" | "equipment">>;
      crit?: boolean;
      select?: boolean;
      twoHanded?: boolean;
    };

    export type ResistOptions = ThresholdOptions & { type?: AffinityType };

    export type DocumentUseOptions = ThresholdOptions & Teriock.Execution.ExecutionOptions & {
      competence?: number;
      noHeighten?: boolean;
    };

    export type UseDocumentOptions = DocumentUseOptions & Teriock.System.ResolveDocumentsOptions & {
      /** An identifier, name or UUID */
      key?: string;
    };
  }
}

export {};
