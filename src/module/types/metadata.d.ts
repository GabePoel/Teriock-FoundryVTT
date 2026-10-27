declare global {
  namespace Teriock.Metadata {
    export type CollectionMetadata = { validate: boolean };

    export type ModelMetadata = { initialCompetence: Teriock.System.CompetenceLevel, pseudos: Record<string, string> };

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
      statGiver: boolean;
      text: boolean;
      triggerable: boolean;
      untrackable: boolean;
      usable: boolean;
      wiki: boolean;
    };

    export type SystemCritMetadata = { enabled: boolean, where: "chatData" | "effectData" };

    export type SystemMetadata = TypeMetadata & {
      automationTags: Partial<AutomationTags>;
      crit: SystemCritMetadata;
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

    export type PlayableCharacterSystemMetadata = CommonSystemMetadata & { defaultChildIdentifiers: TypedIdentifier[] };

    export type ChildSystemMetadata = CommonSystemMetadata & {
      initialKind: string;
      kinds: Record<string, Teriock.Config.KindEntry>;
    };
  }
}

export {};
