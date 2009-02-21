// ==UserScript==
// @name           Techmeme Author Filter
// @description    Hide unwanted articles by a given author.
// @include        http://techmeme.com/
// @include        http://*.techmeme.com/
// ==/UserScript==
(function () {
  var key = 'author_filters', res, get;

  // get filter string
  get = function() { return GM_getValue(key) || ''; };

  // add configuration menu
  GM_registerMenuCommand('Edit Filters...', function() {
    var msg = 'Edit Filters (list of space-separated words):',
        val = get();

    // prompt for and save filters
    if (val = prompt(msg, val))
      GM_setValue(key, val);
  });

  // get filter words and convert them into regular expressions
  res = (get()).split(/\s+/).map(function(str) {
    return new RegExp(str);
  });

  window.addEventListener('DOMContentLoaded', function() {
    // find matching cite elements and hide containing div.item
    getElementsByTagName('cite').filter(function(el) {
      // does this element match any filter word?
      return res.some(function(re, el) { 
        return this.innerHTML.match(re);
      });
    }).forEach(function(el) {
      // walk up to containing div.item element and hide it
      do {
        if (el.name == 'div' && el.className == 'item') {
          el.style.display = 'none';
          el = null;
        }
      } while (el && (el = el.parentNode));
    });
  }, false);
})();
