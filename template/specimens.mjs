/**
 * Where the specimens live, said once for the two things that need it.
 *
 * The build draws one page per arrangement so the admin can lift this site's
 * own markup for a block that has just been put into a post (see
 * `src/lib/entryLoader.ts`). Two other things have to know those addresses: the
 * meta plugin, which tells the edge they are not for strangers, and the admin,
 * which asks for them by name.
 *
 * So the rule is here and not in three places. It is a string format rather
 * than an index or an order — the shapes that drift.
 */

/** The id of one specimen, which is also its address under the collection. */
export function specimenId(type, view) {
  return view === undefined || view === '' ? `_fl-${type}` : `_fl-${type}-${view}`;
}

/**
 * Every specimen this site builds, as addresses.
 *
 * One per arrangement of every type a post may hold — and one per language,
 * because a preview of a Russian post must lift its markup from a Russian page:
 * anything else puts the wrong words and an address that does not exist around
 * the block.
 */
export function specimenAddresses(collections, blocks, locales = []) {
  const out = [];

  for (const collection of collections) {
    for (const kind of collection.body ?? []) {
      const type = blocks.find((one) => one.type === kind);
      if (type === undefined) continue;

      for (const view of type.views ?? [undefined]) {
        const id = specimenId(kind, view?.key);
        for (const locale of ['', ...locales]) {
          const at = locale === '' ? collection.prefix : `/${locale}${collection.prefix}`;
          out.push(`${at}/${id}/`);
        }
      }
    }
  }

  return out.sort();
}
