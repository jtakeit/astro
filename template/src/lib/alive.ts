/**
 * Initialising something on the page, in the two places it can arrive.
 *
 * ── why there are two ───────────────────────────────────────────────────────
 *
 * Everything on a page arrives at load, and a script that queries the document
 * once and attaches what it needs is correct — until something is put on the
 * page afterwards. Then it is not: the new node was never seen, its listeners
 * were never attached, and it sits there inert.
 *
 * That happens here for one reason and it is worth knowing. The studio's admin
 * shows the client a *preview of this site* while they write, and when they put
 * a gallery into a post the built page has no element for it. Rather than
 * drawing its own — it would be guessing at this repository's markup and CSS —
 * it takes the arrangement from a specimen page this build made and puts it
 * where the block goes. What arrives is this site's own markup, in this site's
 * own stylesheet, and everything declarative about it is already right.
 *
 * What is not right is anything a script was supposed to do to it. So the admin
 * fires `fl:placed` on the new node, and this is how a site listens.
 *
 * ── the shape it forces, which is the shape you wanted anyway ───────────────
 *
 * An initialiser registered here is called with a root and must work on it:
 * once with the document at load, and again with a subtree when one appears. A
 * function written that way is also the function that survives view transitions
 * and anything else that swaps part of a page — the browser's own answer,
 * `connectedCallback`, has the same shape for the same reason.
 *
 * Idempotent by scope rather than by flag: it is never called twice with the
 * same node, because the node it is called with is the new one.
 */
export function onAlive(selector: string, start: (node: Element) => void): void {
  const wake = (root: ParentNode): void => {
    if (root instanceof Element && root.matches(selector)) start(root);
    for (const node of root.querySelectorAll(selector)) start(node);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wake(document), { once: true });
  } else {
    wake(document);
  }

  document.addEventListener('fl:placed', (event) => {
    const at = event.target;
    if (at instanceof Element) wake(at);
  });
}
