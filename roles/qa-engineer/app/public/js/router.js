/**
 * Hash routing over sections already in the document. Each view is a
 * `<section data-view="name">`; each sidebar link is an `<a data-route="name">`.
 * Views are addressable, so `#/my-bookings` can be linked to and reloaded.
 */
export function createRouter({ views, onEnter }) {
  const names = Object.keys(views);
  const sections = new Map(names.map((n) => [n, document.querySelector(`[data-view="${n}"]`)]));
  const links = new Map(names.map((n) => [n, document.querySelector(`[data-route="${n}"]`)]));

  function current() {
    const name = location.hash.replace(/^#\/?/, '');
    return names.includes(name) ? name : names[0];
  }

  function show() {
    const name = current();
    for (const [key, section] of sections) section?.classList.toggle('hidden', key !== name);
    for (const [key, link] of links) {
      if (key === name) link?.setAttribute('aria-current', 'page');
      else link?.removeAttribute('aria-current');
    }
    document.querySelector('.content')?.scrollTo?.({ top: 0 });
    onEnter?.(name);
  }

  window.addEventListener('hashchange', show);

  return {
    start: show,
    current,
    go(name) {
      if (location.hash === `#/${name}`) show();
      else location.hash = `#/${name}`;
    },
  };
}
