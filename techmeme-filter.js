// ==UserScript==
// @name           Techmeme Author Filter
// @description    Hide unwanted articles by a given author.
// @include        http://techmeme.com/*
// @include        http://*.techmeme.com/*
// ==/UserScript==

(function () {
  var key = 'author_filters', sum = 0, res, get, find,
      F = Array.prototype.filter, classes = ['item', 'heditem'];

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
  res = get().split(/\s+/).map(function(str) {
    return new RegExp(str, 'i');
  });

  // find - find matching div elements and pass to callback
  find = function(fn) {
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

  window.addEventListener('load', function() {
    try {
      // hide matching items
      find(function(el) {
        el.style.display = 'none';
        sum++;
      });

      // hide matching items
      // if we found matching items, then append a show link
      if (sum > 0) {
        var html = 'Show Hidden (' + sum + ').',
            el = document.createElement('button');

        // create show button
        el.innerHTML = html;
        el.style.zIndex = 9999;
        el.style.position = 'absolute';
        el.style.top = '5px';
        el.style.right = '5px';

        // add click handler
        el.addEventListener('click', function(ev) {
          // show hidden elements, hide button, and stop event
          find(function(el) { el.style.display = 'block'; });
          el.style.display = 'none';
          return false;
        }, false);

        // add show button
        document.body.appendChild(el);
      }
    } catch (err) {
      // alert('Error: ' + err + ' (Techmeme Author Filter)');
    }
  }, false);
})();
