//noinspection JSClosureCompilerSyntax

import TeriockActor from "./actor/actor.mjs";
import TeriockEffect from "./effect/effect.mjs";
import TeriockItem from "./item/item.mjs";
import { BlankMixin } from "./mixins/_module.mjs";

/**
 * Character-specific {@link TeriockActor} class.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockActor}
 * @property {TeriockCharacterModel} system
 * @property {TeriockCharacterSheet} sheet
 * @property {"actor"} type
 * @property {Teriock.UUID<TeriockCharacter>} uuid
 * @property {Teriock.ID<TeriockCharacter>} id
 */
export class TeriockCharacter extends BlankMixin(TeriockActor) {}

/**
 * Creature-specific {@link TeriockActor} class.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockActor}
 * @property {TeriockCreatureModel} system
 * @property {TeriockCreatureSheet} sheet
 * @property {"actor"} type
 * @property {Teriock.UUID<TeriockCreature>} uuid
 * @property {Teriock.ID<TeriockCreature>} id
 */
export class TeriockCreature extends BlankMixin(TeriockActor) {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @extends {TeriockItem}
 * @property {TeriockBodyModel} system
 * @property {TeriockBodySheet} sheet
 * @property {"body"} type
 * @property {Teriock.UUID<TeriockBody>} uuid
 * @property {Teriock.ID<TeriockBody>} id
 */
export class TeriockBody extends BlankMixin(TeriockItem) {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {TeriockItem}
 * @property {TeriockEquipmentModel} system
 * @property {TeriockEquipmentSheet} sheet
 * @property {"equipment"} type
 * @property {Teriock.UUID<TeriockEquipment>} uuid
 * @property {Teriock.ID<TeriockEquipment>} id
 */
export class TeriockEquipment extends BlankMixin(TeriockItem) {}

/**
 * Power-specific {@link TeriockItem} class.
 *
 * @extends {TeriockItem}
 * @property {TeriockPowerModel} system
 * @property {TeriockPowerSheet} sheet
 * @property {"power"} type
 * @property {Teriock.UUID<TeriockPower>} uuid
 * @property {Teriock.ID<TeriockPower>} id
 */
export class TeriockPower extends BlankMixin(TeriockItem) {}

/**
 * Rank-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @extends {TeriockItem}
 * @property {TeriockRankModel} system
 * @property {TeriockRankSheet} sheet
 * @property {"rank"} type
 * @property {Teriock.UUID<TeriockRank>} uuid
 * @property {Teriock.ID<TeriockRank>} id
 */
export class TeriockRank extends BlankMixin(TeriockItem) {}

/**
 * Species-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @extends {TeriockItem}
 * @property {TeriockSpeciesModel} system
 * @property {TeriockSpeciesSheet} sheet
 * @property {"species"} type
 * @property {Teriock.UUID<TeriockSpecies>} uuid
 * @property {Teriock.ID<TeriockSpecies>} id
 */
export class TeriockSpecies extends BlankMixin(TeriockItem) {}

/**
 * Mount-specific {@link TeriockItem} class.
 * @extends {TeriockItem}
 * @property {TeriockMountModel} system
 * @property {TeriockMountSheet} sheet
 * @property {"mount"} type
 * @property {Teriock.UUID<TeriockMount>} uuid
 * @property {Teriock.ID<TeriockMount>} id
 */
export class TeriockMount extends BlankMixin(TeriockItem) {}

/**
 * Wrapper-specific {@link TeriockItem} class.
 * @extends {TeriockItem}
 * @property {TeriockWrapperModel} system
 * @property {TeriockWrapperSheet} sheet
 * @property {"wrapper"} type
 * @property {Teriock.UUID<TeriockWrapper>} uuid
 * @property {Teriock.ID<TeriockWrapper>} id
 */
export class TeriockWrapper extends BlankMixin(TeriockItem) {}

/**
 * Ability-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {TeriockEffect}
 * @property {TeriockAbilityModel} system
 * @property {TeriockAbilitySheet} sheet
 * @property {"ability"} type
 * @property {Teriock.UUID<TeriockAbility>} uuid
 * @property {Teriock.ID<TeriockAbility>} id
 */
export class TeriockAbility extends BlankMixin(TeriockEffect) {}

/**
 * Consequence-specific {@link TeriockEffect} class.
 * @extends {TeriockEffect}
 * @property {"consequence"} type
 * @property {Teriock.ID<TeriockConsequence>} id
 * @property {Teriock.UUID<TeriockConsequence>} uuid
 * @property {TeriockActor} parent
 * @property {TeriockConsequenceModel} system
 * @property {TeriockConsequenceSheet} sheet
 */
export class TeriockConsequence extends BlankMixin(TeriockEffect) {}

/**
 * Attunement-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @extends {TeriockEffect}
 * @property {TeriockAttunementModel} system
 * @property {TeriockAttunementSheet} sheet
 * @property {"attunement"} type
 * @property {Teriock.UUID<TeriockAttunement>} uuid
 * @property {Teriock.ID<TeriockAttunement>} id
 */
export class TeriockAttunement extends BlankMixin(TeriockEffect) {}

/**
 * Condition-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockEffect}
 * @property {TeriockConditionModel} system
 * @property {TeriockConditionSheet} sheet
 * @property {"condition"} type
 * @property {Teriock.UUID<TeriockCondition>} uuid
 * @property {Teriock.ID<TeriockCondition>} id
 */
export class TeriockCondition extends BlankMixin(TeriockEffect) {}

/**
 * Fluency-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockEffect}
 * @property {TeriockFluencyModel} system
 * @property {TeriockFluencySheet} sheet
 * @property {"fluency"} type
 * @property {Teriock.UUID<TeriockFluency>} uuid
 * @property {Teriock.ID<TeriockFluency>} id
 */
export class TeriockFluency extends BlankMixin(TeriockEffect) {}

/**
 * Property-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockEffect}
 * @property {TeriockPropertyModel} system
 * @property {"property"} type
 * @property {Teriock.ID<TeriockProperty>} id
 * @property {Teriock.UUID<TeriockProperty>} uuid
 * @property {TeriockEquipment} parent
 * @property {TeriockPropertySheet} sheet
 */
export class TeriockProperty extends BlankMixin(TeriockEffect) {}

/**
 * Resource-specific {@link TeriockEffect} class.
 * @extends {TeriockEffect}
 * @property {TeriockResourceModel} system
 * @property {TeriockResourceSheet} sheet
 * @property {"resource"} type
 * @property {Teriock.UUID<TeriockResource>} uuid
 * @property {Teriock.ID<TeriockResource>} id
 */
export class TeriockResource extends BlankMixin(TeriockEffect) {}
