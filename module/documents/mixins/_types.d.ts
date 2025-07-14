import {
  TeriockAbility,
  TeriockAttunement,
  TeriockCondition,
  TeriockEffect,
  TeriockEquipment,
  TeriockFluency,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource,
} from "../_module.mjs";

/** The names of each {@link TeriockItem} this contains, in camel case, keyed by type. */
export type ParentItemKeys = {
  equipment?: Set<string>;
  power?: Set<string>;
  rank?: Set<string>;
};

/** Each {@link TeriockItem} this contains, keyed by type. */
export type ParentItemTypes = {
  equipment?: TeriockEquipment[];
  power?: TeriockPower[];
  rank?: TeriockRank[];
};

/** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
export type ParentEffectKeys = {
  ability?: Set<string>;
  attunement?: Set<string>;
  base?: Set<string>;
  condition?: Set<string>;
  effect?: Set<string>;
  fluency?: Set<string>;
  property?: Set<string>;
  resource?: Set<string>;
};

/** Each {@link TeriockEffect} this contains, keyed by type. */
export type ParentEffectTypes = {
  ability?: TeriockAbility[];
  attunement?: TeriockAttunement[];
  base?: TeriockEffect[];
  condition?: TeriockCondition[];
  effect?: TeriockEffect[];
  fluency?: TeriockFluency[];
  property?: TeriockProperty[];
  resource?: TeriockResource[];
};

/** Each {@link TeriockEffect} this contains, keyed by type, in multiple formats. */
export type BuiltEffectTypes = {
  effectTypes: ParentEffectTypes;
  effectKeys: ParentEffectKeys;
};

interface ParentDocumentMixinInterface {
  /**
   * Gets the list of {@link TeriockEffect} documents associated with this document.
   * Helper method for `prepareDerivedData()` that can be called explicitly.
   */
  validEffects: TeriockEffect[];
  /** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
  effectKeys: ParentEffectKeys;
  /** Each {@link TeriockEffect} this contains, keyed by type. */
  effectTypes: ParentEffectTypes;

  /**
   * Gets the list of all {@link TeriockEffect} documents that apply to this document.
   * This includes those that are not currently active.
   */
  buildEffectTypes(): BuiltEffectTypes;

  /**
   * Forces an update of the document by toggling the update counter.
   * This is useful for triggering reactive updates in the UI.
   */
  forceUpdate(): Promise<void>;
}

/**
 * Interface for the ChildDocumentMixin functionality
 */
export interface ChildDocumentMixinInterface {
  /** Checks if the document is fluent. */
  readonly isFluent: boolean;

  /** Checks if the document is proficient. */
  readonly isProficient: boolean;

  /**
   * Calls a hook with the document as the first parameter.
   *
   * @param incant - The hook incantation to call.
   * @param args - Additional arguments to pass to the hook.
   */
  hookCall(incant: string, args?: string[]): void;

  /**
   * Sends a chat message with the document's content.
   *
   * @returns Promise that resolves when the chat message is sent.
   */
  chat(): Promise<void>;

  /**
   * Sends a chat message with the document's image.
   *
   * @returns Promise that resolves when the image message is sent.
   */
  chatImage(): Promise<void>;

  /**
   * Rolls the document, which by default sends a chat message.
   *
   * @returns Promise that resolves when the roll is complete.
   */
  roll(): Promise<void>;

  /**
   * Uses the document, calling hooks and delegating to the system's use method.
   *
   * @param options - Options for using the document.
   * @returns Promise that resolves when the use action is complete.
   */
  use(options: object): Promise<void>;

  /**
   * Duplicates the document within its parent.
   *
   * @returns Promise that resolves to the duplicated document.
   */
  duplicate(): Promise<ChildDocumentMixinInterface>;

  /**
   * Builds a raw message string from the document's message parts.
   *
   * @param options - Options for building the message.
   * @returns The raw message HTML.
   */
  buildRawMessage(options?: Teriock.MessageOptions): HTMLDivElement;

  /**
   * Builds an enriched message from the document's message parts.
   *
   * @param options - Options for building the message.
   * @returns Promise that resolves to the enriched message HTML.
   */
  buildMessage(options?: Teriock.MessageOptions): Promise<string>;

  /**
   * Attempts to pull content from the wiki (default implementation shows error).
   *
   * @returns Promise that resolves when the wiki pull is complete.
   */
  wikiPull(): Promise<void>;

  /**
   * Opens the wiki for this document (default implementation calls wikiPull).
   *
   * @returns Promise that resolves when the wiki is opened.
   */
  wikiOpen(): Promise<void>;
}
