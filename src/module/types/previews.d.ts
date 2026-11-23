import { TeriockDocumentSheet } from "../applications/api/_module.mjs";
import { BasePreviewModel } from "../data/models/preview-models/_module.mjs";

declare global {
  namespace Teriock.Previews {
    /** A raw group definition for a preview. This is made by {@link PreviewGroupBuilder} before any arrangement. */
    export type PreviewGroup = {
      /** Entries in a preview group. */
      docs: Teriock.Embeds.Embeddable[];
      /** The group's "no results" label. */
      empty: string;
      /** Whether the group is hidden entirely when it has no documents. */
      optional?: boolean;
      /** Whether the group's entries can be sorted manually. Defaults to `true`. */
      sortable?: boolean;
    };

    /** A single arranged preview within a {@link RenderedPreviewGroup}. */
    export type RenderedPreviewEntry<T = TeriockActiveEffect | TeriockActor | TeriockItem> = {
      /** The document to render. */
      doc: T;
      /** Whether the card is hidden by the current filter/search. */
      hidden: boolean;
    };

    /** A group that's ready to render after arrangement (filtering/sorting/search). */
    export type RenderedPreviewGroup = {
      /** Sorted entries in a preview group. */
      docs: Teriock.Previews.RenderedPreviewEntry[];
      /** The group's "no results" label. */
      empty: string;
      /** Whether the group's entries can be rearranged by dragging. */
      sortable: boolean;
    };

    /** Preview's current menu states. */
    export type PreviewToggles = { block: boolean, filter: boolean, sort: boolean };

    /**
     * Builds a preview's groups.
     */
    export type PreviewGroupBuilder = (this: TeriockDocumentSheet) => Promise<Teriock.Previews.PreviewGroup[]>;

    /** A preview's add button */
    export type PreviewAddButton = {
      /** A localization key overriding the button's default tooltip. */
      label?: string;
      /** The child type selected by default. Defaults to the first of `types`. */
      type?: Teriock.Documents.ChildType;
      /** The child types offered by the create dialog. Defaults to the preview's `types`. */
      types?: ((app: TeriockDocumentSheet) => Teriock.Documents.ChildType[]) | Teriock.Documents.ChildType[];
    };

    /** The add button render context. */
    export type PreviewAddButtonContext = {
      /** The child type selected by default */
      dataType: Teriock.Documents.ChildType | null;
      /** The comma-separated child types */
      dataTypes: string;
      /** The localized tooltip */
      tooltip: string;
    };

    /** Configuration for a single preview. */
    export type PreviewConfig = {
      /** The add button for previews with custom children. */
      addButton?: Teriock.Previews.PreviewAddButton;
      /** Data passed into the preview model. */
      data?: object;
      /** A handler that builds the preview's groups from the document. */
      groups: Teriock.Previews.PreviewGroupBuilder;
      /**
       * The preview model class.
       */
      model?: typeof BasePreviewModel;
      /** The document types this preview displays. */
      types?: Teriock.Documents.ChildType[];
    };
  }
}

export {};
