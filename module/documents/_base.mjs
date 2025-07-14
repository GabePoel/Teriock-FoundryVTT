const { Actor, Item, ActiveEffect, TokenDocument, Macro, User, Scene, ChatMessage } = foundry.documents;
import ChildDocumentMixin from "./mixins/child-mixin.mjs";
import ParentDocumentMixin from "./mixins/parent-mixin.mjs";

/**
 * This class is a hack to get {@link Actor} intellisense without warnings for unimplemented methods.
 *
 * @extends {Actor}
 * @mixes ParentDocumentMixin
 * @implements {ActorData}
 * @implements{ParentDocumentMixinInterface}
 * @property {EmbeddedCollection<string, TeriockItem>} items
 * @property {EmbeddedCollection<string, TeriockEffect>} effects
 * @property {ParentItemTypes} itemTypes
 * @property {TeriockEffect[]} appliedEffects
 * @property {TeriockEffect[]} temporaryEffects
 * @property {() => Generator<TeriockEffect, void, void>} allApplicableEffects
 * @property {TeriockBaseActorData} system
 * @property {Teriock.ActorType} type
 * @property {"Actor"} documentName
 */
export class BaseTeriockActor extends ParentDocumentMixin(Actor) {}

/**
 * This class is a hack to get {@link Item} intellisense without warnings for unimplemented methods.
 *
 * @extends {Item}
 * @mixes ChildDocumentMixin
 * @mixes ParentDocumentMixin
 * @implements {ItemData}
 * @implements {ChildDocumentMixinInterface}
 * @implements {ParentDocumentMixinInterface}
 * @property {TeriockActor|null} actor
 * @property {EmbeddedCollection<string, TeriockEffect>} effects
 * @property {Readonly<TeriockEffect[]>} transferredEffects
 * @property {TeriockBaseItemData} system
 * @property {Teriock.ItemType} type
 * @property {"Item"} documentName
 */
export class BaseTeriockItem extends ParentDocumentMixin(ChildDocumentMixin(Item)) {}

/**
 * This class is a hack to get {@link ActiveEffect} intellisense without warnings for unimplemented methods.
 *
 * @extends {ActiveEffect}
 * @mixes ChildDocumentMixin
 * @implements {ActiveEffectData}
 * @implements {ChildDocumentMixin}
 * @property {TeriockBaseEffectData} system
 * @property {Teriock.EffectType} type
 * @property {"ActiveEffect"} documentName
 */
export class BaseTeriockEffect extends ChildDocumentMixin(ActiveEffect) {}

/**
 * This class is a hack to get {@link TokenDocument} intellisense without warnings for unimplemented methods.
 *
 * @extends {TokenDocument}
 * @implements {TokenData}
 * @property {Token} token
 * @property {"TokenDocument"} documentName
 */
export class BaseTeriockToken extends TokenDocument {}

/**
 * This class is a hack to get {@link Macro} intellisense without warnings for unimplemented methods.
 *
 * @extends {Macro}
 * @implements {MacroData}
 * @property {"Macro"} documentName
 */
export class BaseTeriockMacro extends Macro {}

/**
 * This class is a hack to get {@link User} intellisense without warnings for unimplemented methods.
 *
 * @extends {User}
 * @implements {UserData}
 * @property {"User"} documentName
 */
export class BaseTeriockUser extends User {}

/**
 * This class is a hack to get {@link Scene} intellisense without warnings for unimplemented methods.
 *
 * @extends {Scene}
 * @implements {SceneData}
 * @property {"Scene"} documentName
 */
export class BaseTeriockScene extends Scene {}

/**
 * This class is a hack to get {@link ChatMessage} intellisense without warnings for unimplemented methods.
 *
 * @extends {ChatMessage}
 * @implements {ChatMessageData}
 * @property {"ChatMessage"} documentName
 */
export class BaseTeriockChatMessage extends ChatMessage {}
