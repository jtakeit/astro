/**
 * One noise tile, for everything in the kit that needs grain.
 *
 * Two places wanted it — the `grain` ground in components/surface/patterns.ts
 * and the `film` treatment on a photograph — and two copies of a texture is how
 * one of them gets retuned and the other does not. It lives here because
 * src/lib is never pruned from a handoff, so neither caller has to own it.
 *
 * Turbulence makes the noise; the colour matrix throws the colour away and
 * keeps the red channel as *alpha*, which is what a CSS mask reads.
 * `stitchTiles` is what lets it repeat without a seam.
 */
export const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.86' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")";

/**
 * How big the tile is drawn.
 *
 * `GRAIN_SIZE` is what it was authored at, and it is right for a ground: a
 * page-sized layer needs a tile large enough that the repeat is never obvious.
 * A photograph is a few hundred pixels wide, so the same tile covers half of it
 * and the noise reads as blotches and streaks rather than as grain — the smaller
 * value scales it down into something the eye takes for film.
 */
export const GRAIN_SIZE = '180px';
export const GRAIN_SIZE_PHOTO = '90px';
