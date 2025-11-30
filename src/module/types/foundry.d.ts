declare global {
  namespace Teriock.Foundry {
    /**
     * Describes the origin of a {@link TeriockChatMessage}.
     */
    export type ChatSpeakerData = {
      /** The `_id` of the {@link TeriockActor
       * } who generated this message */
      actor?: string;
      /** An overridden alias name used instead of the {@link TeriockActor} or {@link TeriockTokenDocument} name */
      alias?: string;
      /** The `_id` of the {@link TeriockScene} where this message was created */
      scene?: string;
      /** The `_id` of the {@link TeriockTokenDocument} who generated this message */
      token?: string;
    };

    export type ContextMenuCallback = (target: HTMLElement) => unknown;

    export type ContextMenuCondition = (html: HTMLElement) => boolean;

    export type ContextMenuEntry = {
      callback: ContextMenuCallback;
      classes?: string;
      condition?: boolean | ContextMenuCondition;
      group?: string;
      icon?: string;
      name: string;
    };

    export type EffectChangeData = {
      /** <schema> The attribute path in the {@link TeriockParent} data which the change modifies */
      key: string;
      /** <schema> The value of the change effect */
      value: string;
      /** <schema> The modification mode with which the change is applied */
      mode: number;
      /** <schema> The priority level with which this change is applied */
      priority: number;
    };

    export type EnrichmentOptions = {
      /** Apply custom enrichers? */
      custom?: boolean;
      /** Replace dynamic document links? */
      documents?: boolean;
      /** Replace embedded content? */
      embeds?: boolean;
      /** Replace hyperlink content? */
      links?: boolean;
      /** A document to resolve relative UUIDs against. */
      relativeTo?: TeriockDocument;
      /** The data object providing context for inline rolls, or a function that produces it. */
      rollData?: object | (() => object);
      /** Replace inline dice rolls? */
      rolls?: boolean;
      /** Include unrevealed secret tags in the final HTML? If false, unrevealed secret blocks will be removed. */
      secrets?: boolean;
    };

    export type TextEditorEnricher = (
      /** The regular expression match result */
      match: RegExpMatchArray,
      /** Options provided to customize text enrichment */
      options?: Teriock.Foundry.EnrichmentOptions,
    ) => Promise<HTMLElement | null>;

    export type TextEditorEnricherConfig = {
      /**
       * The function that will be called on each match. It is expected that this returns an HTML element to be
       * inserted into the final enriched content.
       */
      enricher: Teriock.Foundry.TextEditorEnricher;
      /** A unique ID to assign to the enricher type. Required if you want to use the onRender callback. */
      id?: string;
      /** An optional callback that is invoked when the enriched content is added to the DOM. */
      onRender?: (arg0: HTMLElement) => Promise<void>;
      /** The string pattern to match. Must be flagged as global. */
      pattern: RegExp;
      /**
       * Hoist the replacement element out of its containing element if it replaces the entire contents of the
       * element.
       */
      replaceParent?: boolean;
    };
  }
}

export {};
