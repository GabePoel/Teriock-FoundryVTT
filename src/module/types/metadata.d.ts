declare global {
  namespace Teriock.Metadata {
    export type CollectionMetadata = { validate: boolean };

    export type ModelMetadata = { initialCompetence: Teriock.System.CompetenceLevel, pseudos: Record<string, string> };

    export type ModifierMetadata = ModelMetadata & {
      initialBase: Teriock.System.FormulaString;
      initialDie: string;
      initialMultiplier: number;
      initialScore: number;
    };

    export type UnitMetadata = ModelMetadata & {
      formula: boolean;
      groupLabels: Record<"finite" | "infinite" | "zero", string>;
      icon: string;
      rawOptions: { placeholder?: string } & Record<string, unknown>;
      unitConfig: string | null;
      unitOptions: Record<string, unknown>;
      unlimited: boolean;
    };

    export type TypeMetadata = ModelMetadata & { documentName: string, icon: string, type: string };

    type PseudoDocumentTags = { mechanic: boolean };

    export type PseudoDocumentMetadata = TypeMetadata & { tags: PseudoDocumentTags, typed: boolean };

    type AutomationTags = {
      ability: boolean;
      changes: boolean;
      consumable: boolean;
      harm: boolean;
      interactInExecution: boolean;
      passive: boolean;
      species: boolean;
      triggered: boolean;
      useInExecution: boolean;
    };

    export type AutomationMetadata = PseudoDocumentMetadata & {
      requires: Partial<SystemMetadataTags>;
      tags: PseudoDocumentTags & AutomationTags;
    };

    type SystemMetadataTags = {
      applicable: boolean;
      armament: boolean;
      attunable: boolean;
      blocks: boolean;
      consumable: boolean;
      granted: boolean;
      hierarchy: boolean;
      revealable: boolean;
      simple: boolean;
      statted: boolean;
      transformation: boolean;
      triggerable: boolean;
      untrackable: boolean;
      usable: boolean;
      wiki: boolean;
    };

    export type SystemMetadata = TypeMetadata & {
      automationTags: Partial<AutomationTags>;
      descriptionPath: string | null;
      disabledPath: "disabled" | "system.disabled" | null;
      img: string;
      initialConsumable: boolean;
      preserveOnRefresh: string[];
      sortPaths: string[];
      tags: SystemMetadataTags;
    };

    export type CommonSystemMetadata = SystemMetadata & {
      associationTypes?: Teriock.Documents.ChildType[];
      childTypes: Teriock.Documents.ChildType[];
      importable: boolean;
    };

    export type CharacterActorSystemMetadata = CommonSystemMetadata & { defaultChildIdentifiers: TypedIdentifier[] };

    export type ChildSystemMetadata = CommonSystemMetadata & {
      initialKind: string;
      kinds: Record<string, Teriock.Config.KindEntry>;
    };
  }
}

export {};
