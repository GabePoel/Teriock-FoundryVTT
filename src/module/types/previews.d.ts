import { TeriockDocumentSheet } from "../applications/api/_module.mjs";
import { BasePreviewModel } from "../data/models/preview-models/_module.mjs";

declare global {
  namespace Teriock.Previews {
    /**
     * The surface a preview needs to render, search, sort, and filter something that is not a document. Every other
     * hook a {@link BasePreviewModel} touches is optional.
     */
    export type PreviewEntry = {
      /** The block to render. Must carry the same `uuid` for the preview to match its card in the DOM. */
      embedParts: Teriock.EmbedData.EmbedParts;
      /** Matched against by search and the default name sort. */
      name: string;
      /** A stable, unique key. Need not resolve to a real document. */
      uuid: string;
    };

    /** A raw group definition for a preview, as produced by a {@link PreviewGroupBuilder} before arrangement. */
    export type PreviewGroup = {
      /** The entries in the group. Usually documents, but anything exposing `name`, `uuid`, and `embedParts` renders. */
      docs: (AnyCommonDocument | Teriock.Previews.PreviewEntry)[];
      /** The "no results" label for the group. */
      empty: string;
      /** Whether the group is hidden entirely when it has no documents. */
      optional?: boolean;
    };

    /** A single arranged preview within a {@link RenderedPreviewGroup}. */
    export type RenderedPreviewEntry<T = AnyCommonDocument> = {
      /** The document to render. */
      doc: T;
      /** Whether the card is hidden by the current filter/search. */
      hidden: boolean;
    };

    /** A group after arrangement (filtering/sorting/search), ready to render. */
    export type RenderedPreviewGroup = {
      /** The arranged cards, in DOM order. */
      docs: Teriock.Previews.RenderedPreviewEntry[];
      /** The "no results" label for the group. */
      empty: string;
    };

    /** Transient collapse open-states for a preview's block/sort/filter menus, set by the sheet. */
    export type PreviewToggles = { block: boolean, filter: boolean, sort: boolean };

    /**
     * Builds a preview's groups.
     */
    export type PreviewGroupBuilder = (this: TeriockDocumentSheet) => Promise<Teriock.Previews.PreviewGroup[]>;

    /** A preview's add button */
    export type PreviewAddButton = {
      /** A localization key overriding the button's default tooltip. */
      label?: string;
      /** The child type created on left-click. Omit to make left-click open the menu instead. */
      type?: Teriock.Documents.ChildType;
      /** The child types offered by the context menu, or a resolver called with the app instance. */
      types?: ((app: TeriockDocumentSheet) => Teriock.Documents.ChildType[]) | Teriock.Documents.ChildType[];
    };

    /** The add button state resolved for a render, attached to the preview model and consumed by the template. */
    export type PreviewAddButtonContext = {
      /** The child type created directly on left-click */
      dataType: Teriock.Documents.ChildType | null;
      /** The comma-separated menu child types */
      dataTypes: string | null;
      /** The localized tooltip */
      tooltip: string;
      /** The resolved child types */
      types: Teriock.Documents.ChildType[];
    };

    /** Configuration for a single preview on a sheet: a map entry of preview id to `{ model?, data?, groups, addButton? }`. */
    export type PreviewConfig = {
      /** The add button for the preview. Omit for previews whose children are not manually created. */
      addButton?: Teriock.Previews.PreviewAddButton;
      /** A source patch applied to the model via `updateSource` (e.g. display defaults). */
      data?: object;
      /** Builds the preview's groups from the document. */
      groups: Teriock.Previews.PreviewGroupBuilder;
      /**
       * The preview model class, or a resolver called with the app instance that returns one. Defaults to the type's
       * configured preview model, then {@link BasePreviewModel}.
       */
      model?: typeof BasePreviewModel;
    };
  }
}

export {};
