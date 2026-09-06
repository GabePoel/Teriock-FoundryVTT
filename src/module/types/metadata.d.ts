declare global {
  namespace Teriock.Metadata {
    export type BaseMetadata = { initialCompetence: Teriock.System.CompetenceLevel, pseudos: Record<string, string> };

    type TypeTags = BaseMetadata & { embed: boolean, panel: boolean };

    export type TypeMetadata = { icon: string, tags: TypeTags, type: string };

    export type PseudoDocumentMetadata = TypeMetadata & { documentName: string, typed: boolean };

    type SystemMetadataTags = TypeTags & {
      armament: boolean;
      attunable: boolean;
      consumable: boolean;
      hierarchy: boolean;
      revealable: boolean;
      statGiver: boolean;
      text: boolean;
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
