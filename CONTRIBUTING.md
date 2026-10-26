# AI Policy

Not a fan TBH. Every time it's been tried on this codebase it's resulted in really complicated over-engineered solutions and has had to be removed and redone. So now the policy is no AI. This applies to any [code](./src/module/), [assets](./src/assets/), etc.

# Code

## Introduction

This is become a very large and interconnected codebase that touches on a lot of parts of the Foundry API. Efforts have been made to try and label things, use consistent conventions, and keep stuff organized. But this work is inevitably imperfect and there will always be bugs.

## Organization and Basic Concepts

By-and-large, folders and the API are organized so that they match the normal Foundry folder structure and API conventions. Data models have `_types.d.ts` files which overlay the types corresponding to their schema. And mixins are used _heavily_ throughout the codebase. Types are typically namespaced and stuff should be defined in `TERIOCK.CONFIG` and `TERIOCK.CONST` instead of hard-coded where possible.

Beyond that, there are a few new code concepts that Foundry doesn't use. For one, we have "pseudo-documents" serving all sorts of purposes. These are data models that are designed to mirror the functionality and ergonomics of normal documents. There are a bunch of types of these with the main ones being `Automation`, and `Activation` pseudo-documents. These implement automated functionality on other document types and provide handling for buttons in chat messages respectively.

There are also some data models that are never persisted to the database and are mainly used so we can take advantage of a bunch of Foundry's existing data model helpers. These are `Execution` data models and `Preview` data models. The `Execution` ones provide a consistent UI and pipeline for a user to execute some activity in the game. It could be using an [ability](https://wiki.teriock.com/index.php?title=Core:Abilities), pulling from the [Death Bag](https://wiki.teriock.com/index.php?title=Core:Death_Bag), or anything else. The `Preview` models are used to display arrays of documents or pseudo-documents and are always attached to some `ApplicationV2` that they live in.

Obviously, there is _way more_ to the codebase than what's written up here. But hopefully these document the actually added-on things rather than just _how_ stuff is done? Maybe?

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
