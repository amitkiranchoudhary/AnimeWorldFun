// One shared wind for the whole sky layer, so branches, blossoms and petals
// all move together. There is always a light, wavering breeze; every few
// seconds a gust builds up quickly, holds, and dies away slowly. Scrolling
// fast adds a push of its own. The wind blows left → right across the screen.

export type Wind = {
  /** call once per frame; `scroll` = recent scroll speed */
  update(t: number, dt: number, scroll: number): void;
  /** overall wind strength, ~0.2 (calm breeze) … ~1.4 (strong gust while scrolling) */
  readonly strength: number;
  /** just the gust part, 0 … 1 */
  readonly gust: number;
};

export function createWind(): Wind {
  let gust = 0;
  let peak = 0;
  let gustLeft = 0; // seconds left in the current gust
  let nextGust = 2.5; // seconds until the next one
  let strength = 0.25;

  return {
    update(t, dt, scroll) {
      nextGust -= dt;
      if (nextGust <= 0) {
        gustLeft = 1.8 + Math.random() * 2.2;
        peak = 0.55 + Math.random() * 0.45;
        nextGust = gustLeft + 5 + Math.random() * 6;
      }
      gustLeft = Math.max(0, gustLeft - dt);
      const target = gustLeft > 0 ? peak : 0;
      // gusts arrive fast and fade slowly
      const rate = target > gust ? 2.8 : 0.7;
      gust += (target - gust) * (1 - Math.exp(-dt * rate));

      const breeze = 0.22 + Math.sin(t * 0.7) * 0.07 + Math.sin(t * 1.9 + 1) * 0.04;
      strength = Math.min(1.4, breeze + gust + Math.min(Math.abs(scroll), 6) * 0.06);
    },
    get strength() {
      return strength;
    },
    get gust() {
      return gust;
    },
  };
}
