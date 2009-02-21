// ==UserScript==
// @name           Techmeme Author Filter
// @description    Hide unwanted articles by a given author.
// @include        http://techmeme.com/*
// @include        http://*.techmeme.com/*
// ==/UserScript==

(function () {
  var key = 'author_filters', sum = 0, get, find, add_btn,
      F = Array.prototype.filter, classes = ['item', 'heditem'];

  /*
   * get - get filter words as string.
   */
  get = function() { 
    return GM_getValue(key) || ''; 
  };

  /*
   * find - find matching article elements and pass to callback.
   */
  find = (function() { 
    // convert filter words into regular expressions (cached)
    var res = get().split(/\s+/).map(function(str) {
      return new RegExp(str, 'i');
    });
    
    return function(fn) {
      // find matching cite elements
      F.call(document.getElementsByTagName('cite'), function(el) {
        var str = el.innerHTML || '';

        return res.length > 0 && res.some(function(re) { 
          return str.match(re); 
        });
      }).forEach(function(el) {
        // walk up to containing div.item element and pass it to callback
        while (el && (el = el.parentNode)) {
          if (el.tagName == 'DIV' && classes.indexOf(el.className) != -1) {
            fn(el);
            el = null;
          }
        }
      });
    };
  })();

  /*
   * add_btn - add "Show Hidden" button to top-right corner 
   */
  add_btn = function() {
    var bd = 'Show Hidden (' + sum + ')',
        el = document.createElement('button');

    // move button to top-right corner
    el.innerHTML = bd;
    el.style.zIndex = 9999;
    el.style.position = 'absolute';
    el.style.top = '5px';
    el.style.right = '5px';

    // add click handler
    el.addEventListener('click', function(ev) {
      // show hidden articles
      find(function(el) { 
        el.style.display = 'block'; 
      });

      // hide button
      el.style.display = 'none';

      // stop event
      return false;
    }, false);

    // add show button
    document.body.appendChild(el);
  };

  // add configuration menu
  GM_registerMenuCommand('Edit Filters...', function() {
    var msg = 'Edit Filters (list of space-separated words):',
        val = get();

    // prompt for and save filters
    if (val = prompt(msg, val))
      GM_setValue(key, val);
  });

  // add window.load handler
  window.addEventListener('load', function() {
    // hide matching items
    find(function(el) {
      el.style.display = 'none';
      sum++;
    });

    // add show button if we hid anything
    if (sum > 0)
      add_btn();
  }, false);
})();
