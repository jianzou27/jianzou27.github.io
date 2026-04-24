/* jianzou.me — filters.js
 *
 * Client-side search + year + section filter for .pub rows on the
 * publications and presentations pages. Runs on any page containing a
 * [data-filters] root — silent otherwise. Pandoc-emitted HTML doesn't
 * need any extra markup beyond what publication.Rmd / presentation.Rmd
 * provide.
 */
(function () {
  const root = document.querySelector('[data-filters]');
  if (!root) return;

  const search = root.querySelector('input[data-filter="search"]');
  const yearSel = root.querySelector('select[data-filter="year"]');
  const tabs = Array.from(root.querySelectorAll('.filter-tabs .tab'));
  const count = root.querySelector('.filter-count');

  const scope = document.querySelector('[data-filter-scope]') || document;
  const pubs = Array.from(scope.querySelectorAll('.pub'));
  const lists = Array.from(scope.querySelectorAll('.pub-list'));
  const labels = Array.from(scope.querySelectorAll('.section-label'));

  /* populate year dropdown from data-year attrs */
  if (yearSel) {
    const years = Array.from(new Set(pubs.map(p => p.dataset.year).filter(Boolean)))
      .sort().reverse();
    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSel.appendChild(opt);
    });
  }

  let activeSection = 'all';

  function apply() {
    const q = (search && search.value || '').trim().toLowerCase();
    const y = (yearSel && yearSel.value || '');

    let shown = 0;
    pubs.forEach(p => {
      const text = p.textContent.toLowerCase();
      const okQ = !q || text.includes(q);
      const okY = !y || p.dataset.year === y;
      const tokens = (p.dataset.section || '').split(/\s+/).filter(Boolean);
      const okS = activeSection === 'all' || tokens.includes(activeSection);
      const show = okQ && okY && okS;
      p.classList.toggle('is-hidden', !show);
      if (show) shown += 1;
    });

    /* hide empty list + its section label */
    lists.forEach(list => {
      const visible = Array.from(list.querySelectorAll('.pub:not(.is-hidden)')).length;
      list.classList.toggle('is-hidden', visible === 0);
      const label = list.previousElementSibling;
      if (label && label.classList.contains('section-label')) {
        label.classList.toggle('is-hidden', visible === 0);
      }
    });

    if (count) {
      count.textContent = shown + ' of ' + pubs.length + ' entries';
    }
  }

  if (search)  search.addEventListener('input', apply);
  if (yearSel) yearSel.addEventListener('change', apply);

  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(x => x.classList.remove('is-active'));
      t.classList.add('is-active');
      activeSection = t.dataset.section || 'all';
      apply();
    });
  });

  /* hide list + label helpers */
  const style = document.createElement('style');
  style.textContent = '.pub-list.is-hidden,.section-label.is-hidden{display:none}';
  document.head.appendChild(style);

  apply();
})();
