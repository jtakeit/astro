export interface Named {
  slug: string;
  title: string;
  takes?: number;
  costs?: number;
  /** A price by the hour of the week instead of `costs`: rows of a day, a span and a price. The list says «from …»; the price is the slot's. */
  rates?: { day: string; from: number; until: number; costs: number }[];
  group?: string;
}

export interface BookingFormProps {
  services: Named[];
  resources?: Named[];
  locale: string;
  daysAhead?: number;
  combine?: boolean;
  currency?: string;
  scale?: string;
  kind?: string;
  /** Where `/api/` is from this page; under the preview the site is served at `/p/<slug>/`. */
  api?: string;
  /** The element around the form, `jtk-booking`; `''` for none. */
  tag?: string;
  now?: Date;
}

/** What the form sends to /api/book, as `data-sends` says it. */
export const SENDS: readonly string[];
/** The booking form as HTML, wrapped in `<jtk-booking>`. */
export function renderBookingForm(props: BookingFormProps): string;
