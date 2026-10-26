# Code

## Category Tags

Some parts of the codebase that are essential for interlocking functionality as dispersed across a bunch of different seemingly unrelated files. These are given `@category` tags so they can be found and kept in sync.

### Behavior

Things marked with `@category Behavior` relate to inherited document behavior settings. These are settings with a world scope and then are _also_ duplicated on individual documents in case they need to be overwritten.

### Delegation

The `@category Delegation` tag means something is related to GM query delegation. This is used for database operations that need to be handled by the GM.

### Dependents

Sometimes an `Item` will depend on an `ActiveEffect` in a similar way to as if it was embedded in it. That functionality is tagged with `@category Dependents`.

### Ethereal

Any functionality relating to Ethereal vision and what can/can't be seen by Ethereal or Material beings is given the `@category Ethereal` tag.

### Groups

We use `CombatantGroup` documents to handle `Combatant` documents that share a turn and the different types of ways those turns can be shared. This requires a substantial amount of modification to the default combat, tracker, and turn behavior so it is marked with `@category Groups`.

### Hierarchy

The `@category Hierarchy` tag is similar to `@category Dependents` except it's for the cases where documents of one class have an embedded-style relationship with another document of the same class in the same collection.

### Perception

We use `@category Perception` for anything relating broadly to token vision.

### Transformation

Anything relating to the specific process by which `Actor` documents can have their species' changed by `ActiveEffect` documents is given the `@category Transformation` tag.

### Triggers

The trigger pipeline is _kind of_ like a local version of Foundry's hooks and is used to handle stuff that occurs automatically and triggers off of other events within an `Actor`. These aren't _fully_ automatic because that would cause friction and confusion and instead make chat messages whenever something happens. This functionality is given the `@category Triggers` tag.