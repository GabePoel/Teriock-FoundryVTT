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
 * @property {TeriockCharacterData} system
 * @property {TeriockCharacterSheet} sheet
 * @property {"actor"} type
 * @property {Teriock.UUID<TeriockCharacter>} uuid
 * @property {Teriock.ID<TeriockCharacter>} id
 */
export class TeriockCharacter extends TeriockActor {}

/**
 * Equipment-specific {@link TeriockItem} class.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @property {TeriockEquipmentData} system
 * @property {TeriockEquipmentSheet} sheet
 * @property {"equipment"} type
 * @property {Teriock.UUID<TeriockEquipment>} uuid
 * @property {Teriock.ID<TeriockEquipment>} id
 */
export class TeriockEquipment extends TeriockItem {}

/**
 * Power-specific {@link TeriockItem} class.
 *
 * @property {TeriockPowerData} system
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
 * @property {TeriockRankData} system
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
 * @property {TeriockSpeciesData} system
 * @property {TeriockSpeciesSheet} sheet
 * @property {"species"} type
 * @property {Teriock.UUID<TeriockSpecies>} uuid
 * @property {Teriock.ID<TeriockSpecies>} id
 */
export class TeriockSpecies extends TeriockItem {}

/**
 * Mechanic-specific {@link TeriockItem} class.
 *
 * @property {TeriockMechanicData} system
 * @property {TeriockMechanicSheet} sheet
 * @property {"rank"} type
 * @property {Teriock.UUID<TeriockMechanic>} uuid
 * @property {Teriock.ID<TeriockMechanic>} id
 */
export class TeriockMechanic extends TeriockItem {}

/**
 * Wrapper-specific {@link TeriockItem} class.
 *
 * @property {TeriockWrapperData} system
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
 * @property {TeriockAbilityData} system
 * @property {TeriockAbilitySheet} sheet
 * @property {"ability"} type
 * @property {Teriock.UUID<TeriockAbility>} uuid
 * @property {Teriock.ID<TeriockAbility>} id
 */
export class TeriockAbility extends TeriockEffect {}

/**
 * Consequence-specific {@link TeriockEffect} class.
 *
 * @property {TeriockConsequenceData} system
 * @property {TeriockConsequenceSheet} sheet
 * @property {"consequence"} type
 * @property {Teriock.UUID<TeriockConsequence>} uuid
 * @property {Teriock.ID<TeriockConsequence>} id
 */
export class TeriockConsequence extends TeriockEffect {}

/**
 * Attunement-specific {@link TeriockEffect} class.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @property {TeriockAttunementData}
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
 * @property {TeriockConditionData} system
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
 * @property {TeriockFluencyData} system
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
 * @property {TeriockPropertyData} system
 * @property {TeriockPropertySheet} sheet
 * @property {"property"} type
 * @property {Teriock.UUID<TeriockProperty>} uuid
 * @property {Teriock.ID<TeriockProperty>} id
 */
export class TeriockProperty extends TeriockEffect {}

/**
 * Resource-specific {@link TeriockEffect} class.
 *
 * @property {TeriockResourceData} system
 * @property {TeriockResourceSheet} sheet
 * @property {"resource"} type
 * @property {Teriock.UUID<TeriockResource>} uuid
 * @property {Teriock.ID<TeriockResource>} id
 */
export class TeriockResource extends TeriockEffect {}
