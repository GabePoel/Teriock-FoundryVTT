declare global {
  namespace Teriock.Metadata {
    type BaseMetadataTags = { embed: boolean, panel: boolean };

    export type BaseMetadata = {
      initialCompetence?: Teriock.System.CompetenceLevel;
      initialKind?: string;
      pseudos: Record<string, string>;
      tags: BaseMetadataTags;
      type: string;
    };

    export type PseudoDocumentMetadata = BaseMetadata & { documentName: string, icon: string, typed: boolean };

    type SystemMetadataTags = BaseMetadataTags & {
      armament: boolean;
      attunable: boolean;
      consumable: boolean;
      statGiver: boolean;
      usable: boolean;
      wiki: boolean;
    };

    export type SystemMetadata = BaseMetadata & {
      childTypes: Teriock.Documents.ChildType[];
      disabledPath: "disabled" | "system.disabled" | null;
      hierarchy: boolean;
      preservedProperties: string[];
      tags: SystemMetadataTags;
    };
  }
}

export {};
