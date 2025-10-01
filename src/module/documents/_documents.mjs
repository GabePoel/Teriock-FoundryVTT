import TeriockActor from "./actor.mjs";
import TeriockEffect from "./effect.mjs";
import TeriockItem from "./item.mjs";

/**
 * Character-specific {@link TeriockActor} class.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @property {TeriockCharacterModel} system
 * @property {TeriockCharacterSheet} sheet
 * @property {"actor"} type
 * @property {Teriock.UUID<TeriockCharacter>} uuid
 * @property {Teriock.ID<TeriockCharacter>} id
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
 * @property {TeriockCreatureModel} system
 * @property {TeriockCreatureSheet} sheet
 * @property {"actor"} type
 * @property {Teriock.UUID<TeriockCreature>} uuid
 * @property {Teriock.ID<TeriockCreature>} id
 */
export class TeriockCreature extends TeriockActor {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Body Parts](https://wiki.teriock.com/index.php/Category:Body_parts)
 *
 * @property {TeriockBodyModel} system
 * @property {TeriockBodySheet} sheet
 * @property {"body"} type
 * @property {Teriock.UUID<TeriockBody>} uuid
 * @property {Teriock.ID<TeriockBody>} id
 */
export class TeriockBody extends TeriockItem {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @property {TeriockEquipmentModel} system
 * @property {TeriockEquipmentSheet} sheet
 * @property {"equipment"} type
 * @property {Teriock.UUID<TeriockEquipment>} uuid
 * @property {Teriock.ID<TeriockEquipment>} id
 */
export class TeriockEquipment extends TeriockItem {}

/**
 * Power-specific {@link TeriockItem} class.
 *
 * @property {TeriockPowerModel} system
 * @property {TeriockPowerSheet} sheet
 * @property {"power"} type
 * @property {Teriock.UUID<TeriockPower>} uuid
 * @property {Teriock.ID<TeriockPower>} id
 */
export class TeriockPower extends TeriockItem {}

/**
 * Rank-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 *
 * @property {TeriockRankModel} system
 * @property {TeriockRankSheet} sheet
 * @property {"rank"} type
 * @property {Teriock.UUID<TeriockRank>} uuid
 * @property {Teriock.ID<TeriockRank>} id
 */
export class TeriockRank extends TeriockItem {}

/**
 * Species-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Creatures](https://wiki.teriock.com/index.php/Category:Creatures)
 *
 * @property {TeriockSpeciesModel} system
 * @property {TeriockSpeciesSheet} sheet
 * @property {"species"} type
 * @property {Teriock.UUID<TeriockSpecies>} uuid
 * @property {Teriock.ID<TeriockSpecies>} id
 */
export class TeriockSpecies extends TeriockItem {}

/**
 * Mechanic-specific {@link TeriockItem} class.
 * @property {"rank"} type
 * @property {Teriock.ID<TeriockMechanic>} id
 * @property {Teriock.UUID<TeriockMechanic>} uuid
 * @property {TeriockActor} parent
 * @property {TeriockMechanicModel} system
 * @property {TeriockMechanicSheet} sheet
 */
export class TeriockMechanic extends TeriockItem {}

/**
 * Wrapper-specific {@link TeriockItem} class.
 * @property {TeriockWrapperModel} system
 * @property {TeriockWrapperSheet} sheet
 * @property {"wrapper"} type
 * @property {Teriock.UUID<TeriockWrapper>} uuid
 * @property {Teriock.ID<TeriockWrapper>} id
 */
export class TeriockWrapper extends TeriockItem {}

/**
 * Ability-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @property {TeriockAbilityModel} system
 * @property {TeriockAbilitySheet} sheet
 * @property {"ability"} type
 * @property {Teriock.UUID<TeriockAbility>} uuid
 * @property {Teriock.ID<TeriockAbility>} id
 */
export class TeriockAbility extends TeriockEffect {}

/**
 * Consequence-specific {@link TeriockEffect} class.
 * @property {"consequence"} type
 * @property {Teriock.ID<TeriockConsequence>} id
 * @property {Teriock.UUID<TeriockConsequence>} uuid
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
 * @property {TeriockAttunementModel}
 * @property {TeriockAttunementSheet} sheet
 * @property {"attunement"} type
 * @property {Teriock.UUID<TeriockAttunement>} uuid
 * @property {Teriock.ID<TeriockAttunement>} id
 */
export class TeriockAttunement extends TeriockEffect {}

/**
 * Condition-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @property {TeriockConditionModel} system
 * @property {TeriockConditionSheet} sheet
 * @property {"condition"} type
 * @property {Teriock.UUID<TeriockCondition>} uuid
 * @property {Teriock.ID<TeriockCondition>} id
 */
export class TeriockCondition extends TeriockEffect {}

/**
 * Fluency-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @property {TeriockFluencyModel} system
 * @property {TeriockFluencySheet} sheet
 * @property {"fluency"} type
 * @property {Teriock.UUID<TeriockFluency>} uuid
 * @property {Teriock.ID<TeriockFluency>} id
 */
export class TeriockFluency extends TeriockEffect {}

/**
 * Property-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @property {"property"} type
 * @property {Teriock.ID<TeriockProperty>} id
 * @property {Teriock.UUID<TeriockProperty>} uuid
 * @property {TeriockEquipment} parent
 * @property {TeriockPropertyModel} system
 * @property {TeriockPropertySheet} sheet
 */
export class TeriockProperty extends TeriockEffect {}

/**
 * Resource-specific {@link TeriockEffect} class.
 * @property {TeriockResourceModel} system
 * @property {TeriockResourceSheet} sheet
 * @property {"resource"} type
 * @property {Teriock.UUID<TeriockResource>} uuid
 * @property {Teriock.ID<TeriockResource>} id
 */
export class TeriockResource extends TeriockEffect {}
