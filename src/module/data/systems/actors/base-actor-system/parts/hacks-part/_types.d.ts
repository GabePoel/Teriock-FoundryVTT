export default interface ActorHacksPartInterface {
  /** <base> Hacks */
  hacks: Record<
    Teriock.Parameters.Actor.HackableBodyPart,
    Teriock.Foundry.BarField
  >;
}
