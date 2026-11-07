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

    type TypeTags = { embed: boolean, panel: boolean };

    export type TypeMetadata = ModelMetadata & { documentName: string, icon: string, tags: TypeTags, type: string };

    type PseudoDocumentTags = TypeTags & { mechanic: boolean, triggered: boolean };

    export type PseudoDocumentMetadata = TypeMetadata & { tags: PseudoDocumentTags, typed: boolean };

    type AutomationTags = PseudoDocumentTags & {
      ability: boolean;
      changes: boolean;
      harm: boolean;
      interactInExecution: boolean;
      passive: boolean;
      species: boolean;
      useInExecution: boolean;
    };

    export type AutomationMetadata = PseudoDocumentMetadata & {
      requires: Partial<SystemMetadataTags>;
      tags: AutomationTags;
    };

    type SystemMetadataTags = TypeTags & {
      armament: boolean;
      attunable: boolean;
      consumable: boolean;
      embedPanelBlocks: boolean;
      granted: boolean;
      hierarchy: boolean;
      revealable: boolean;
      simple: boolean;
      statGiver: boolean;
      text: boolean;
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
      childTypes: Teriock.Documents.ChildType[];
      importable: boolean;
      visibleTypes: Teriock.Documents.ChildType[];
    };

    export type CharacterActorSystemMetadata = CommonSystemMetadata & { defaultChildIdentifiers: TypedIdentifier[] };

    export type ChildSystemMetadata = CommonSystemMetadata & {
      initialKind: string;
      kinds: Record<string, Teriock.Config.KindEntry>;
    };
  }
}

export {};
