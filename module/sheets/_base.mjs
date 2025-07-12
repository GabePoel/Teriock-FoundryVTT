const { ActorSheetV2, ItemSheetV2, ActiveEffectConfig } = foundry.applications.sheets;
import TeriockSheet from "./mixins/sheet-mixin.mjs";

/**
 * This class is a hack to get {@link ActorSheetV2} intellisense without warnings for unimplemented methods.
 * @extends {ActorSheetV2}
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export class BaseActorSheet extends TeriockSheet(ActorSheetV2) {}

/**
 * This class is a hack to get {@link ItemSheetV2} intellisense without warnings for unimplemented methods.
 * @extends {ItemSheetV2}
 * @property {TeriockItem} item
 * @property {TeriockItem} document
 */
export class BaseItemSheet extends TeriockSheet(ItemSheetV2) {}

/**
 * This class is a hack to get {@link ActiveEffectConfig} intellisense without warnings for unimplemented methods.
 * @extends {ActiveEffectConfig}
 * @property {TeriockEffect} effect
 * @property {TeriockEffect} document
 */
export class BaseEffectSheet extends TeriockSheet(ActiveEffectConfig) {}
