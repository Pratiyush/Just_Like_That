/*
 * card.js: tiny data-binding + text-fitting runtime shared by every card design.
 *
 * Content comes from (later wins):
 *   1. <script type="application/json" id="card-data"> inside the design (sample content)
 *   2. window.CARD_DATA (injected by render.js --data)
 *   3. URL ?data=<base64 JSON>  and simple URL params like ?headline=Hello&kicker=NEW
 * Merging is shallow: an override replaces a whole field (arrays/objects included).
 *
 * Markup attributes:
 *   data-field="path"        set the element's text from data (dot paths: "left.name", "points.0").
 *                            Empty/missing value hides the element (add data-keep to keep it).
 *   data-highlight[="key"]   wrap occurrences of data.highlight (string or array) in <mark class="hl">.
 *                            "**word**" inside any text also becomes <mark class="hl">word</mark>.
 *                            "\n" in text becomes a line break.
 *   data-if="path"           hide the element when the value at path is empty.
 *   data-list="path"         repeat the element's first child once per array item.
 *     data-item[="key"]      inside the repeated child: text = the item (or item[key]).
 *     data-item-index[="2"]  inside the repeated child: text = 1-based index (optionally zero-padded).
 *                            Each clone also gets style --i (0-based) and data-index (1-based).
 *   data-fit                 shrink font-size until the text fits the element's own box.
 *                            The element needs a constrained height (height/max-height/flex) and overflow:hidden.
 *     data-fit-max="140"     start at this px size (lets short text grow); default = computed size.
 *     data-fit-min="48"      never go below this px size; default = 45% of the start size.
 *
 * Data keys with special meaning:
 *   theme: { "--accent": "#ff0" }   CSS custom properties applied to #card.
 *
 * Custom rendering (charts etc.):
 *   Card.onRender(function (data, card) { ... })   runs after binding, before fonts load and text is fitted.
 * When done, <html data-ready="1"> is set and Card.ready resolves.
 */
(function () {
  'use strict';

  var hooks = [];
  var resolveReady;
  var Card = (window.Card = {
    data: {},
    ready: new Promise(function (r) { resolveReady = r; }),
    onRender: function (fn) { hooks.push(fn); },
    get: get,
    format: format,
    fit: fitAll,
    warnings: []
  });

  function warn(msg) {
    Card.warnings.push(msg);
    console.warn('[card] ' + msg);
  }

  function get(path, obj) {
    obj = obj === undefined ? Card.data : obj;
    if (path === '' || path === undefined || path === null) return obj;
    var parts = String(path).split('.');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  function isEmpty(v) {
    return v === undefined || v === null || v === '' || v === false ||
      (Array.isArray(v) && v.length === 0);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /* Text -> safe HTML with **mark**, \n line breaks and optional highlight terms. */
  function format(value, highlight) {
    var html = escapeHtml(value);
    html = html.replace(/\*\*(.+?)\*\*/g, '<mark class="hl">$1</mark>');
    var terms = [];
    if (Array.isArray(highlight)) terms = highlight;
    else if (!isEmpty(highlight)) terms = [highlight];
    terms.forEach(function (t) {
      t = String(t).trim();
      if (!t) return;
      var re = new RegExp('(' + escapeRegExp(escapeHtml(t)) + ')(?![^<]*>)(?![^<]*</mark>)', 'i');
      html = html.replace(re, '<mark class="hl">$1</mark>');
    });
    return html.replace(/\r?\n/g, '<br>');
  }

  function decodeBase64Json(s) {
    s = s.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function loadData() {
    var data = {};
    var el = document.getElementById('card-data');
    if (el) {
      try { data = JSON.parse(el.textContent); }
      catch (e) { warn('invalid JSON in #card-data: ' + e.message); }
    }
    if (window.CARD_DATA && typeof window.CARD_DATA === 'object') {
      data = Object.assign({}, data, window.CARD_DATA);
    }
    var params = new URLSearchParams(location.search);
    if (params.get('data')) {
      try { data = Object.assign({}, data, decodeBase64Json(params.get('data'))); }
      catch (e) { warn('could not decode ?data= param: ' + e.message); }
    }
    params.forEach(function (v, k) {
      if (k !== 'data') data[k] = v;
    });
    return data;
  }

  function bindLists(root) {
    var lists = Array.prototype.slice.call(root.querySelectorAll('[data-list]'));
    lists.forEach(function (list) {
      var items = get(list.getAttribute('data-list'));
      var tpl = list.__tpl || list.firstElementChild;
      if (!tpl) return;
      list.__tpl = tpl;
      list.innerHTML = '';
      if (!Array.isArray(items) || items.length === 0) {
        list.hidden = true;
        return;
      }
      list.hidden = false;
      list.style.setProperty('--count', items.length);
      items.forEach(function (item, i) {
        var clone = tpl.cloneNode(true);
        clone.style.setProperty('--i', i);
        clone.setAttribute('data-index', i + 1);
        var targets = Array.prototype.slice.call(clone.querySelectorAll('[data-item], [data-item-index]'));
        if (clone.hasAttribute('data-item') || clone.hasAttribute('data-item-index')) targets.unshift(clone);
        targets.forEach(function (t) {
          if (t.hasAttribute('data-item-index')) {
            var pad = parseInt(t.getAttribute('data-item-index'), 10) || 0;
            var n = String(i + 1);
            while (n.length < pad) n = '0' + n;
            t.textContent = n;
            return;
          }
          var key = t.getAttribute('data-item');
          var v = key ? get(key, item) : item;
          if (v !== null && typeof v === 'object') v = '';
          if (isEmpty(v)) { t.hidden = true; return; }
          t.innerHTML = format(v, t.hasAttribute('data-highlight') ? Card.data.highlight : null);
        });
        list.appendChild(clone);
      });
    });
  }

  function bindFields(root) {
    root.querySelectorAll('[data-field]').forEach(function (el) {
      var v = get(el.getAttribute('data-field'));
      if (v !== null && typeof v === 'object') v = Array.isArray(v) ? v.join(' · ') : '';
      if (isEmpty(v) && v !== 0) {
        el.innerHTML = '';
        if (!el.hasAttribute('data-keep')) el.hidden = true;
        return;
      }
      el.hidden = false;
      var hlKey = el.getAttribute('data-highlight');
      var hl = el.hasAttribute('data-highlight') ? get(hlKey || 'highlight') : null;
      el.innerHTML = format(v, hl);
    });
    root.querySelectorAll('[data-if]').forEach(function (el) {
      el.hidden = isEmpty(get(el.getAttribute('data-if')));
    });
  }

  function applyTheme(card) {
    var theme = Card.data.theme;
    if (!theme || typeof theme !== 'object') return;
    Object.keys(theme).forEach(function (k) {
      card.style.setProperty(k.indexOf('--') === 0 ? k : '--' + k, theme[k]);
    });
  }

  function fits(el) {
    return el.scrollHeight <= el.clientHeight + 1 && el.scrollWidth <= el.clientWidth + 1;
  }

  function fitOne(el) {
    if (el.hidden) return;
    if (el.__fitStart === undefined) {
      var attrMax = parseFloat(el.getAttribute('data-fit-max'));
      el.__fitStart = attrMax || parseFloat(getComputedStyle(el).fontSize);
    }
    var size = el.__fitStart;
    var min = parseFloat(el.getAttribute('data-fit-min')) || Math.round(size * 0.45);
    el.style.fontSize = size + 'px';
    var guard = 300;
    while (!fits(el) && size > min && guard-- > 0) {
      size = Math.max(min, size - Math.max(1, size * 0.03));
      el.style.fontSize = size + 'px';
    }
    if (!fits(el)) {
      var name = el.getAttribute('data-field') || el.getAttribute('data-list') || el.className || el.tagName;
      warn('text still overflows at min size (' + min + 'px): ' + name);
    }
  }

  function fitAll() {
    var card = document.getElementById('card');
    if (!card) return;
    card.querySelectorAll('[data-fit]').forEach(fitOne);
  }

  function nextFrame() {
    return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); });
  }

  function previewScale(card) {
    if (window.__RENDER__) return;
    var stage = card.parentElement;
    if (!stage.classList.contains('card-stage')) {
      stage = document.createElement('div');
      stage.className = 'card-stage';
      card.parentNode.insertBefore(stage, card);
      stage.appendChild(card);
      document.body.style.padding = '24px 0';
    }
    function resize() {
      var s = Math.min(1, (window.innerWidth - 32) / 1080, (window.innerHeight - 48) / 1350);
      s = Math.max(s, 0.2);
      stage.style.width = 1080 * s + 'px';
      stage.style.height = 1350 * s + 'px';
      card.style.transform = 'scale(' + s + ')';
    }
    resize();
    window.addEventListener('resize', resize);
  }

  async function run() {
    var card = document.getElementById('card');
    if (!card) { warn('no #card element'); return; }
    Card.data = loadData();
    bindLists(card);
    bindFields(card);
    applyTheme(card);
    for (var i = 0; i < hooks.length; i++) {
      try { await hooks[i](Card.data, card); }
      catch (e) { warn('onRender hook failed: ' + (e && e.message)); console.error(e); }
    }
    void card.offsetHeight;
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
    await nextFrame();
    try { await document.fonts.ready; } catch (e) { /* ignore */ }
    fitAll();
    await nextFrame();
    previewScale(card);
    document.documentElement.setAttribute('data-ready', '1');
    resolveReady(Card.data);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else setTimeout(run, 0);
})();
