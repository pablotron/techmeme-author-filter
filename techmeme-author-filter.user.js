// ==UserScript==
// @name           Techmeme Author Filter
// @description    Hide unwanted articles by a given author.
// @include        http://techmeme.com/*
// @include        http://*.techmeme.com/*
// ==/UserScript==

(function () {
  var key = 'author_filters', sum = 0, show_btn,
      F = Array.prototype.filter, classes = ['item', 'heditem'];

  /*
   * get - get filter words as string.
   */
  var get = function() { 
    return (GM_getValue(key) || '').replace(/^\s*|\s*$/g, ''); 
  };

  /*
   * find - find matching article elements and pass to callback.
   */
  var find = function(fn) {
    // convert filter words into regular expressions
    var res = get().split(/\s+/).filter(function(str) {
      return str && str.match(/\S/);
    }).map(function(str) {
      return new RegExp(str, 'i');
    });
  
    // find matching cite elements
    F.call(document.getElementsByTagName('cite'), function(el) {
      var str = el.innerHTML || '';

      return res.length && res.some(function(re) { return str.match(re); });
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

  /*
   * show - show all matching articles
   */
  var show = function() {
    // show hidden articles
    find(function(el) { 
      el.style.display = 'block'; 
    });

    // reset sum
    sum = 0;

    // disable show btn
    show_btn.style.display = 'none';
    show_btn.innerHTML = 'Show All (0)';
  };

  /*
   * hide - hide all matching articles 
   */
  var hide = function() {
    // hide matching items
    find(function(el) {
      el.style.display = 'none';
      sum++;
    });

    // enable show button if we hid anything
    if (sum > 0) {
      show_btn.style.display = 'inline';
      show_btn.innerHTML = 'Show All (' + sum + ')';
    }
  };

  var edit = function() {
    var msg = 'Edit Filters (list of space-separated words):',
        val = get();

    // prompt for and save filters
    if (val = prompt(msg, val)) {
      // show everything that was hidden
      show();

      // apply new value to config
      GM_setValue(key, val);

      // reset sum and hide all matching items
      hide();
    }
  };

  /*
   * init - add config buttons to top-right corner 
   */
  var init = function() {
    var btn, div = document.createElement('div');

    // move div to top-right corner
    div = document.createElement('div');
    div.style.zIndex = 9999;
    div.style.position = 'absolute';
    div.style.top = '5px';
    div.style.right = '8px';

    // create show button
    btn = show_btn = document.createElement('button');
    btn.style.display = 'none';
    btn.innerHTML = 'Show All (0)';
    div.appendChild(btn);

    // add show btn handler
    btn.addEventListener('click', function(ev) {
      // show hidden articles  and stop event
      show();
      return false;
    }, false);

    // create edit button
    btn = document.createElement('button');
    btn.innerHTML = 'Edit Filters';
    btn.style.marginLeft = '5px';
    btn.addEventListener('click', edit, false);
    div.appendChild(btn);

    // add buttons to screen
    document.body.appendChild(div);
  };

  // init buttons, add configuration menu item, and add window load handler
  GM_registerMenuCommand('Edit Filters...', edit);
  window.addEventListener('load', function() {
    // add config buttons
    init();

    // hide matching articles
    hide();
  }, false);
})();
