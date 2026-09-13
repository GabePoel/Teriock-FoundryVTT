declare global {
  namespace Teriock.Metadata {
    export type CollectionMetadata = { validate: boolean };

    export type ModelMetadata = { initialCompetence: Teriock.System.CompetenceLevel, pseudos: Record<string, string> };

    type TypeTags = ModelMetadata & { embed: boolean, panel: boolean };

    export type TypeMetadata = { icon: string, tags: TypeTags, type: string };

    type PseudoDocumentTags = TypeTags & { mechanic: boolean, triggered: boolean };

    export type PseudoDocumentMetadata = TypeMetadata & {
      documentName: string;
      tags: PseudoDocumentTags;
      typed: boolean;
    };

    type AutomationTags = PseudoDocumentTags & {
      changes: boolean;
      interactInExecution: boolean;
      useInExecution: boolean;
    };

    export type AutomationMetadata = PseudoDocumentMetadata & { tags: AutomationTags };

    type SystemMetadataTags = TypeTags & {
      armament: boolean;
      attunable: boolean;
      consumable: boolean;
      crit: boolean;
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

    export type SystemMetadata = TypeMetadata & {
      disabledPath: "disabled" | "system.disabled" | null;
      preservedProperties: string[];
      tags: SystemMetadataTags;
    };

    export type CommonSystemMetadata = SystemMetadata & {
      childTypes: Teriock.Documents.ChildType[];
      visibleTypes: Teriock.Documents.ChildType[];
    };

    export type ChildSystemMetadata = CommonSystemMetadata & {
      initialKind: string;
      kinds: Record<string, Teriock.Config.KindEntry>;
    };
  }
}

export {};
