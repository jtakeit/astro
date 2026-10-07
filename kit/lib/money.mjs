/**
 * A price as the page says it: «2 300 ₴», not «2 300,00 UAH».
 *
 * Minor units in, as the platform stores them. The narrow sign, because a
 * language's own data may write a currency as its code; no kopecks on a whole
 * price, because «,00» on a price list reads like a spreadsheet. And no sign
 * at all where the site has not said what its prices are in — one made up
 * here is a lie on every price: a hotel's hryvnias read as francs (2 October
 * 2026). The currency is the site's, from the brief, written into
 * jtk/site.json by the platform; it is for showing a price, nothing more.
 *
 * @param {number} minor
 * @param {string | undefined} currency
 * @param {string} locale
 * @returns {string}
 */
export function money(minor, currency, locale) {
  const value = minor / 100;
  const digits = Number.isInteger(value) ? 0 : 2;
  if (!currency) {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: digits,
    maximumFractionDigits: 2,
  }).format(value);
}
