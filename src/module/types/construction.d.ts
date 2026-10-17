/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  /** Class constructor. */
  type Constructor<T = object> = abstract new(...args: never[]) => T;

  /** Mixin base constraint that keeps the instance of `C` and the names of its statics. */
  type MixinBase<C extends Constructor = Constructor> =
    & (new(...args: any[]) => C extends Constructor<infer I> ? I : never)
    & { [K in keyof C]: any; };

  /** Mixin base `T` with instance data `I` declared by the mixin. */
  type InitializedDataModel<T, I> = T & (new(...args: any[]) => I);

  /** A mixin that turns class `From` into class `To`. */
  type Mixin<From, To> = (base: From) => To;

  /**
   * Applies mixins in order so each one is instantiated on the class before it.
   * @todo Find a better way to handle this or just give up on the typing life altogether and live in a cave.
   */
  // dprint-ignore
  interface MixClasses {
    <B, R1>(Base: B, m1: Mixin<B, R1>): R1;
    <B, R1, R2>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>): R2;
    <B, R1, R2, R3>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>): R3;
    <B, R1, R2, R3, R4>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>): R4;
    <B, R1, R2, R3, R4, R5>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>): R5;
    <B, R1, R2, R3, R4, R5, R6>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>): R6;
    <B, R1, R2, R3, R4, R5, R6, R7>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>): R7;
    <B, R1, R2, R3, R4, R5, R6, R7, R8>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>): R8;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>): R9;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>): R10;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>): R11;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>): R12;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>): R13;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>): R14;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>): R15;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>): R16;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>): R17;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>): R18;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>): R19;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>): R20;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>, m21: Mixin<R20, R21>): R21;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>, m21: Mixin<R20, R21>, m22: Mixin<R21, R22>): R22;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>, m21: Mixin<R20, R21>, m22: Mixin<R21, R22>, m23: Mixin<R22, R23>): R23;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>, m21: Mixin<R20, R21>, m22: Mixin<R21, R22>, m23: Mixin<R22, R23>, m24: Mixin<R23, R24>): R24;
    <B, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10, R11, R12, R13, R14, R15, R16, R17, R18, R19, R20, R21, R22, R23, R24, R25>(Base: B, m1: Mixin<B, R1>, m2: Mixin<R1, R2>, m3: Mixin<R2, R3>, m4: Mixin<R3, R4>, m5: Mixin<R4, R5>, m6: Mixin<R5, R6>, m7: Mixin<R6, R7>, m8: Mixin<R7, R8>, m9: Mixin<R8, R9>, m10: Mixin<R9, R10>, m11: Mixin<R10, R11>, m12: Mixin<R11, R12>, m13: Mixin<R12, R13>, m14: Mixin<R13, R14>, m15: Mixin<R14, R15>, m16: Mixin<R15, R16>, m17: Mixin<R16, R17>, m18: Mixin<R17, R18>, m19: Mixin<R18, R19>, m20: Mixin<R19, R20>, m21: Mixin<R20, R21>, m22: Mixin<R21, R22>, m23: Mixin<R22, R23>, m24: Mixin<R23, R24>, m25: Mixin<R24, R25>): R25;
  }
}

export {};
