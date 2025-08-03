import ChildDocumentMixin from "./mixins/child-mixin.mjs";
import ParentDocumentMixin from "./mixins/parent-mixin.mjs";

const {
  ActiveEffect,
  Actor,
  ChatMessage,
  Combat,
  Item,
  Macro,
  Scene,
  TokenDocument,
  User,
  Folder,
} = foundry.documents;
const { CompendiumCollection, CompendiumFolderCollection } =
  foundry.documents.collections;
const { WorldCollection } = foundry.documents.abstract;

/**
 * This class is a hack to get {@link Actor} intellisense without warnings for unimplemented methods.
 *
 * @extends {Actor}
 * @extends {ClientDocument}
 * @mixes ParentDocumentMixin
 * @implements {ActorData}
 * @implements {ParentDocumentMixinInterface}
 * @property {EmbeddedCollection<string, TeriockItem>} items
 * @property {EmbeddedCollection<string, TeriockEffect>} effects
 * @property {ParentItemTypes} itemTypes
 * @property {ParentItemKeys} itemKeys
 * @property {TeriockEffect[]} appliedEffects
 * @property {TeriockEffect[]} temporaryEffects
 * @property {() => Generator<TeriockEffect, void, void>} allApplicableEffects
 * @property {TeriockBaseActorData} system
 * @property {Teriock.ActorType} type
 * @property {"Actor"} documentName
 @property {boolean} isOwner
 */
export class BaseTeriockActor extends ParentDocumentMixin(Actor) {}

/**
 * This class is a hack to get {@link Item} intellisense without warnings for unimplemented methods.
 *
 * @extends {Item}
 * @extends {ClientDocument}
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
 @property {boolean} isOwner
 */
export class BaseTeriockItem extends ParentDocumentMixin(
  ChildDocumentMixin(Item),
) {}

/**
 * This class is a hack to get {@link ActiveEffect} intellisense without warnings for unimplemented methods.
 *
 * @extends {ActiveEffect}
 * @extends {ClientDocument}
 * @mixes ChildDocumentMixin
 * @implements {ActiveEffectData}
 * @property {TeriockBaseEffectData} system
 * @property {Teriock.EffectType} type
 * @property {"ActiveEffect"} documentName
 * @property {boolean} isOwner
 */
export class BaseTeriockEffect extends ChildDocumentMixin(ActiveEffect) {}

/**
 * This class is a hack to get {@link TokenDocument} intellisense without warnings for unimplemented methods.
 *
 * @extends {TokenDocument}
 * @extends {ClientDocument}
 * @implements {TokenData}
 * @property {Token} token
 * @property {TeriockActor} actor
 * @property {"TokenDocument"} documentName
 * @property {boolean} isOwner
 */
export class BaseTeriockToken extends TokenDocument {}

/**
 * This class is a hack to get {@link Macro} intellisense without warnings for unimplemented methods.
 *
 * @extends {Macro}
 * @extends {ClientDocument}
 * @implements {MacroData}
 * @property {"Macro"} documentName
 * @property {boolean} isOwner
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
 * This class is a hack to get {@link Folder} intellisense without warnings for unimplemented methods.
 *
 * @extends {Folder}
 * @implements {FolderData}
 * @property {"Folder"} documentName
 */
export class BaseTeriockFolder extends Folder {}

/**
 * This class is a hack to get {@link ChatMessage} intellisense without warnings for unimplemented methods.
 *
 * @extends {ChatMessage}
 * @implements {ChatMessageData}
 * @property {TeriockBaseMessageData} system
 * @property {"ChatMessage"} documentName
 */
export class BaseTeriockMessage extends ChatMessage {}

/**
 * This class is a hack to get {@link Combat} intellisense without warnings for unimplemented methods.
 *
 * @extends {Combat}
 * @implements {CombatData}
 * @property {"Combat"} documentName
 */
export class BaseTeriockCombat extends Combat {}

/**
 * This class is a hack to get {@link CompendiumCollection} intellisense without warnings for unimplemented methods.
 *
 * @property {(name: string, options?: { strict?: boolean }) => Folder} getName
 * @property {"Folder"} documentName
 */
export class BaseTeriockCompendiumFolderCollection extends CompendiumFolderCollection {}

/**
 * This class is a hack to get {@link CompendiumCollection} intellisense without warnings for unimplemented methods.
 *
 * @extends {CompendiumCollection<T>}
 * @property {TeriockCompendiumFolderCollection} folders
 * @property {Collection<string, T>} index
 * @property {(name: string, options?: { strict?: boolean }) => T} getName
 */
export class BaseTeriockCompendiumCollection extends CompendiumCollection {}

/**
 * This class is a hack to get {@link WorldCollection} intellisense without warnings for unimplemented methods.
 *
 * @extends {WorldCollection<T>}
 */
export class BaseTeriockWorldCollection extends WorldCollection {}
