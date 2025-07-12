const { Actor, Item, ActiveEffect, TokenDocument } = foundry.documents;
import ParentDocumentMixin from "./mixins/parent-mixin.mjs";
import ChildDocumentMixin from "./mixins/child-mixin.mjs";

/**
 * This class is a hack to get {@link Actor} intellisense without warnings for unimplemented methods.
 * @extends {Actor}
 * @implements {ActorData}
 */
export class BaseTeriockActor extends ParentDocumentMixin(Actor) {}

/**
 * This class is a hack to get {@link Item} intellisense without warnings for unimplemented methods.
 * @extends {Item}
 * @implements {ItemData}
 */
export class BaseTeriockItem extends ParentDocumentMixin(ChildDocumentMixin(Item)) {}

/**
 * This class is a hack to get {@link ActiveEffect} intellisense without warnings for unimplemented methods.
 * @extends {ActiveEffect}
 * @implements {ActiveEffectData}
 */
export class BaseTeriockEffect extends ChildDocumentMixin(ActiveEffect) {}

/**
 * This class is a hack to get {@link TokenDocument} intellisense without warnings for unimplemented methods.
 * @extends {TokenDocument}
 * @implements {TokenData}
 */
export class BaseTeriockToken extends TokenDocument {}
