//noinspection JSClosureCompilerSyntax

import TeriockActor from "./actor/actor.mjs";
import TeriockEffect from "./effect/effect.mjs";
import TeriockItem from "./item/item.mjs";

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
 * @property {UUID<TeriockCharacter>} uuid
 * @property {ID<TeriockCharacter>} id
 */
export class TeriockCharacter extends TeriockActor {}

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
 * @property {UUID<TeriockCreature>} uuid
 * @property {ID<TeriockCreature>} id
 */
export class TeriockCreature extends TeriockActor {}

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
 * @property {UUID<TeriockBody>} uuid
 * @property {ID<TeriockBody>} id
 */
export class TeriockBody extends TeriockItem {}

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
 * @property {UUID<TeriockEquipment>} uuid
 * @property {ID<TeriockEquipment>} id
 */
export class TeriockEquipment extends TeriockItem {}

/**
 * Power-specific {@link TeriockItem} class.
 *
 * @extends {TeriockItem}
 * @property {TeriockPowerModel} system
 * @property {TeriockPowerSheet} sheet
 * @property {"power"} type
 * @property {UUID<TeriockPower>} uuid
 * @property {ID<TeriockPower>} id
 */
export class TeriockPower extends TeriockItem {}

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
 * @property {UUID<TeriockRank>} uuid
 * @property {ID<TeriockRank>} id
 */
export class TeriockRank extends TeriockItem {}

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
 * @property {UUID<TeriockSpecies>} uuid
 * @property {ID<TeriockSpecies>} id
 */
export class TeriockSpecies extends TeriockItem {}

/**
 * Mount-specific {@link TeriockItem} class.
 * @extends {TeriockItem}
 * @property {TeriockMountModel} system
 * @property {TeriockMountSheet} sheet
 * @property {"mount"} type
 * @property {UUID<TeriockMount>} uuid
 * @property {ID<TeriockMount>} id
 */
export class TeriockMount extends TeriockItem {}

/**
 * Wrapper-specific {@link TeriockItem} class.
 * @extends {TeriockItem}
 * @property {TeriockWrapperModel} system
 * @property {TeriockWrapperSheet} sheet
 * @property {"wrapper"} type
 * @property {UUID<TeriockWrapper>} uuid
 * @property {ID<TeriockWrapper>} id
 */
export class TeriockWrapper extends TeriockItem {}

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
 * @property {UUID<TeriockAbility>} uuid
 * @property {ID<TeriockAbility>} id
 */
export class TeriockAbility extends TeriockEffect {}

/**
 * Consequence-specific {@link TeriockEffect} class.
 * @extends {TeriockEffect}
 * @property {"consequence"} type
 * @property {ID<TeriockConsequence>} id
 * @property {UUID<TeriockConsequence>} uuid
 * @property {TeriockActor} parent
 * @property {TeriockConsequenceModel} system
 * @property {TeriockConsequenceSheet} sheet
 */
export class TeriockConsequence extends TeriockEffect {}

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
 * @property {UUID<TeriockAttunement>} uuid
 * @property {ID<TeriockAttunement>} id
 */
export class TeriockAttunement extends TeriockEffect {}

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
 * @property {UUID<TeriockCondition>} uuid
 * @property {ID<TeriockCondition>} id
 */
export class TeriockCondition extends TeriockEffect {}

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
 * @property {UUID<TeriockFluency>} uuid
 * @property {ID<TeriockFluency>} id
 */
export class TeriockFluency extends TeriockEffect {}

/**
 * Property-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockEffect}
 * @property {TeriockPropertyModel} system
 * @property {"property"} type
 * @property {ID<TeriockProperty>} id
 * @property {UUID<TeriockProperty>} uuid
 * @property {TeriockEquipment} parent
 * @property {TeriockPropertySheet} sheet
 */
export class TeriockProperty extends TeriockEffect {}

/**
 * Resource-specific {@link TeriockEffect} class.
 * @extends {TeriockEffect}
 * @property {TeriockResourceModel} system
 * @property {TeriockResourceSheet} sheet
 * @property {"resource"} type
 * @property {UUID<TeriockResource>} uuid
 * @property {ID<TeriockResource>} id
 */
export class TeriockResource extends TeriockEffect {}
