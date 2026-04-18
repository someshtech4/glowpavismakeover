/**
 * ╔══════════════════════════════════════════════════════╗
 * ║    Glow Pavi's Makeover — Supabase Content Loader   ║
 * ║    Version 2.0  |  glowpavis.in                     ║
 * ╚══════════════════════════════════════════════════════╝
 * Add this to ALL pages just before </body>:
 * <script src="./supabase-loader.js"></script>
 */

// ══════════════════════════════════════════════════════
// YOUR CREDENTIALS — Already filled in!
// ══════════════════════════════════════════════════════
var SUPABASE_URL = 'https://ubtkkiyrzxntjwpyyoal.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGtraXlyenhudGp3cHl5b2FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MzU3MDMsImV4cCI6MjA5MjExMTcwM30.4WiNMGPMMs99pvPjzeIyyWDBUiYMt7BMONWNXNh32kY';
// ══════════════════════════════════════════════════════

(function () {

  // ── Detect which page ────────────────────────────────
  var filename = window.location.pathname.split('/').pop().toLowerCase() || 'index.html';
  var PAGE = 'home';
  if (filename.indexOf('bridal') !== -1)   PAGE = 'bridal';
  else if (filename.indexOf('party') !== -1)    PAGE = 'party';
  else if (filename.indexOf('skin') !== -1)     PAGE = 'skincare';
  else if (filename.indexOf('about') !== -1)    PAGE = 'about';

  // ── Supabase fetch ───────────────────────────────────
  function dbFetch(endpoint) {
    return fetch(SUPABASE_URL + endpoint, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY
      }
    }).then(function(r) {
      if (!r.ok) return [];
      return r.json();
    }).catch(function() { return []; });
  }

  function getContent() {
    return dbFetch('/rest/v1/gp_content?page=eq.' + PAGE + '&select=section,key,value')
      .then(function(rows) {
        var map = {};
        rows.forEach(function(r) {
          if (!map[r.section]) map[r.section] = {};
          map[r.section][r.key] = r.value;
        });
        return map;
      });
  }

  function getGallery(section) {
    return dbFetch('/rest/v1/gp_gallery?page=eq.' + PAGE + '&section=eq.' + section + '&order=created_at.asc&select=*');
  }

  // ── Helpers ──────────────────────────────────────────
  function setBg(el, url) {
    if (!el || !url) return;
    el.style.backgroundImage = "url('" + url + "')";
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center top';
    el.style.backgroundRepeat = 'no-repeat';
  }

  function setImgSrc(el, url, alt) {
    if (!el || !url) return;
    el.src = url;
    el.removeAttribute('onerror');
    el.style.display = 'block';
    if (alt) el.alt = alt;
  }

  function getMain(arr) {
    return arr.find(function(i) { return i.is_main; }) || arr[0];
  }

  // ══════════════════════════════════════════════════════
  // HOME PAGE
  // ══════════════════════════════════════════════════════
  function loadHome(content) {
    var hero  = content.hero  || {};
    var trust = content.trust || {};

    // Hero title
    if (hero.title) {
      var ht = document.querySelector('.hero-title');
      if (ht) {
        var em = ht.querySelector('em');
        var emText = em ? em.outerHTML : '';
        if (hero.italic) emText = '<em>' + hero.italic + '</em>';
        ht.innerHTML = hero.title + ' ' + emText;
      }
    }
    if (hero.subtitle) {
      var el = document.querySelector('.hero-subtitle');
      if (el) el.textContent = hero.subtitle;
    }

    // Trust bar numbers
    var nums = document.querySelectorAll('.trust-num');
    if (trust.brides  && nums[0]) nums[0].textContent = trust.brides;
    if (trust.years   && nums[1]) nums[1].textContent = trust.years;
    if (trust.reviews && nums[2]) nums[2].textContent = trust.reviews;
    if (trust.cities  && nums[3]) nums[3].textContent = trust.cities;

    // Bento images
    return Promise.all([
      getGallery('bridal_card'),
      getGallery('party_card'),
      getGallery('skin_card'),
      getGallery('hero_bg')
    ]).then(function(results) {
      var bBg = document.querySelector('.bento-bg.bridal');
      var pBg = document.querySelector('.bento-bg.party');
      var sBg = document.querySelector('.bento-bg.skin');

      if (results[0].length) setBg(bBg, getMain(results[0]).url);
      if (results[1].length) setBg(pBg, getMain(results[1]).url);
      if (results[2].length) setBg(sBg, getMain(results[2]).url);
      if (results[3].length) {
        var heroBg = document.querySelector('.hero-bg');
        if (heroBg) setBg(heroBg, getMain(results[3]).url);
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // BRIDAL PAGE
  // bridal-makeup.html structure:
  //   Before/After: .ba-card > .ba-slider > .ba-before-panel (bg) + .ba-after-inner (bg)
  //   Instagram:    #igGrid > .ig-tile (background-image)
  // ══════════════════════════════════════════════════════
  function loadBridal(content) {
    var hero = content.hero || {};

    // Hero text
    if (hero.title || hero.italic) {
      var ht = document.querySelector('.hero-title');
      if (ht) {
        var em = ht.querySelector('em');
        if (hero.title) {
          var tNodes = [];
          ht.childNodes.forEach(function(n) { if (n.nodeType === 3) tNodes.push(n); });
          if (tNodes[0]) tNodes[0].textContent = hero.title + ' ';
        }
        if (hero.italic && em) em.textContent = hero.italic;
      }
    }
    if (hero.subtitle) {
      var el = document.querySelector('.hero-subtitle');
      if (el) el.textContent = hero.subtitle;
    }

    return Promise.all([
      getGallery('before_after'),
      getGallery('instagram'),
      getGallery('portfolio')
    ]).then(function(results) {
      var baImgs       = results[0];
      var igImgs       = results[1];
      var portfolioImgs = results[2];

      // ── Before / After ───────────────────────────────
      // Structure: .ba-card > .ba-slider > .ba-before-panel + .ba-after-panel > .ba-after-inner
      if (baImgs.length) {
        var sliders = document.querySelectorAll('.ba-card .ba-slider');
        sliders.forEach(function(slider, i) {
          var bImg = baImgs[i * 2];
          var aImg = baImgs[i * 2 + 1] || baImgs[i * 2];
          if (bImg) {
            var bp = slider.querySelector('.ba-before-panel');
            setBg(bp, bImg.url);
            var emoji = slider.querySelector('.ba-emoji-wrap');
            if (emoji) emoji.style.display = 'none';
          }
          if (aImg) {
            var ai = slider.querySelector('.ba-after-inner');
            setBg(ai, aImg.url);
          }
        });
      }

      // ── Instagram Grid ───────────────────────────────
      // Structure: #igGrid > .ig-tile (set background-image)
      if (igImgs.length) {
        var grid = document.getElementById('igGrid');
        if (grid) {
          var tiles = grid.querySelectorAll('.ig-tile');
          // Update existing tiles
          tiles.forEach(function(tile, i) {
            if (!igImgs[i]) return;
            setBg(tile, igImgs[i].url);
            var emoji = tile.querySelector('.ig-tile-emoji');
            if (emoji) emoji.style.display = 'none';
            var playIcon = tile.querySelector('.ig-play-icon');
            if (playIcon) playIcon.style.display = 'none';
          });
          // Add extra tiles if more images
          if (igImgs.length > tiles.length) {
            igImgs.slice(tiles.length).forEach(function(img) {
              var tile = document.createElement('div');
              tile.className = 'ig-tile reveal';
              tile.style.backgroundImage = "url('" + img.url + "')";
              tile.style.backgroundSize = 'cover';
              tile.style.backgroundPosition = 'center';
              tile.style.aspectRatio = '1';
              tile.style.borderRadius = '16px';
              tile.style.overflow = 'hidden';
              tile.style.cursor = 'pointer';
              tile.style.border = '1px solid rgba(201,168,76,0.1)';
              tile.style.transition = 'transform 0.4s, box-shadow 0.4s';
              grid.appendChild(tile);
            });
          }
        }
      }

      // ── Portfolio Grid (if exists) ────────────────────
      if (portfolioImgs.length) {
        var pgrid = document.querySelector('.gallery-grid, .portfolio-grid');
        if (pgrid) {
          var imgs = pgrid.querySelectorAll('img');
          portfolioImgs.forEach(function(imgData, i) {
            if (imgs[i]) setImgSrc(imgs[i], imgData.url, imgData.alt_text);
          });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // PARTY PAGE
  // party-makeup.html structure:
  //   Hero portrait: .hero-portrait img
  //   Before/After:  .ba-compare > .ba-before img + .ba-after img
  //   Gallery:       works-grid or gallery imgs
  // ══════════════════════════════════════════════════════
  function loadParty(content) {
    var hero = content.hero || {};

    // Hero text
    if (hero.title || hero.italic) {
      var ht = document.querySelector('.hero-title');
      if (ht) {
        var em = ht.querySelector('em');
        if (hero.title) {
          var tNodes = [];
          ht.childNodes.forEach(function(n) { if (n.nodeType === 3) tNodes.push(n); });
          if (tNodes[0]) tNodes[0].textContent = hero.title + ' ';
        }
        if (hero.italic && em) em.textContent = hero.italic;
      }
    }
    if (hero.subtitle) {
      var el = document.querySelector('.hero-subtitle');
      if (el) el.textContent = hero.subtitle;
    }

    return Promise.all([
      getGallery('before_after'),
      getGallery('gallery'),
      getGallery('hero_portrait')
    ]).then(function(results) {
      var baImgs      = results[0];
      var galleryImgs = results[1];
      var heroImgs    = results[2];

      // Hero portrait
      if (heroImgs.length) {
        var portrait = document.querySelector('.hero-portrait img');
        if (portrait) setImgSrc(portrait, heroImgs[0].url, 'Party Makeup');
      }

      // ── Before / After ───────────────────────────────
      // Structure: .ba-compare > .ba-before img + .ba-after img
      if (baImgs.length) {
        var cards = document.querySelectorAll('.ba-compare');
        cards.forEach(function(card, i) {
          var bImg = baImgs[i * 2];
          var aImg = baImgs[i * 2 + 1];
          if (bImg) {
            var bEl = card.querySelector('.ba-before img');
            if (bEl) setImgSrc(bEl, bImg.url, bImg.alt_text || 'Before');
          }
          if (aImg) {
            var aEl = card.querySelector('.ba-after img');
            if (aEl) setImgSrc(aEl, aImg.url, aImg.alt_text || 'After');
          }
        });
      }

      // ── Gallery images ────────────────────────────────
      if (galleryImgs.length) {
        var grid = document.querySelector('.works-grid, .gallery-grid, .occ-grid');
        if (grid) {
          var imgs = grid.querySelectorAll('img');
          galleryImgs.forEach(function(imgData, i) {
            if (imgs[i]) setImgSrc(imgs[i], imgData.url, imgData.alt_text);
          });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // SKIN CARE PAGE
  // skin-care.html structure similar to party page
  // ══════════════════════════════════════════════════════
  function loadSkincare(content) {
    var hero = content.hero || {};

    if (hero.title || hero.italic) {
      var ht = document.querySelector('.hero-title');
      if (ht) {
        var em = ht.querySelector('em');
        if (hero.title) {
          var tNodes = [];
          ht.childNodes.forEach(function(n) { if (n.nodeType === 3) tNodes.push(n); });
          if (tNodes[0]) tNodes[0].textContent = hero.title + ' ';
        }
        if (hero.italic && em) em.textContent = hero.italic;
      }
    }
    if (hero.subtitle) {
      var el = document.querySelector('.hero-subtitle');
      if (el) el.textContent = hero.subtitle;
    }

    return Promise.all([
      getGallery('before_after'),
      getGallery('gallery')
    ]).then(function(results) {
      var baImgs      = results[0];
      var galleryImgs = results[1];

      // Before/After — try .ba-compare (party style) first
      if (baImgs.length) {
        var compareCards = document.querySelectorAll('.ba-compare');
        if (compareCards.length) {
          compareCards.forEach(function(card, i) {
            var bImg = baImgs[i * 2];
            var aImg = baImgs[i * 2 + 1];
            if (bImg) {
              var bEl = card.querySelector('.ba-before img');
              if (bEl) setImgSrc(bEl, bImg.url, bImg.alt_text || 'Before');
            }
            if (aImg) {
              var aEl = card.querySelector('.ba-after img');
              if (aEl) setImgSrc(aEl, aImg.url, aImg.alt_text || 'After');
            }
          });
        } else {
          // Try .ba-slider style (bridal style)
          var sliders = document.querySelectorAll('.ba-card .ba-slider');
          sliders.forEach(function(slider, i) {
            var bImg = baImgs[i * 2];
            var aImg = baImgs[i * 2 + 1] || baImgs[i * 2];
            if (bImg) setBg(slider.querySelector('.ba-before-panel'), bImg.url);
            if (aImg) setBg(slider.querySelector('.ba-after-inner'), aImg.url);
          });
        }
      }

      // Gallery
      if (galleryImgs.length) {
        var grid = document.querySelector('.treatment-grid, .works-grid, .gallery-grid');
        if (grid) {
          var imgs = grid.querySelectorAll('img');
          galleryImgs.forEach(function(imgData, i) {
            if (imgs[i]) setImgSrc(imgs[i], imgData.url, imgData.alt_text);
          });
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // ABOUT PAGE
  // ══════════════════════════════════════════════════════
  function loadAbout(content) {
    var story = content.story || {};

    if (story.heading) {
      var h = document.querySelector('.page-hero-title, .hero-title, .about-heading');
      if (h) {
        var em = h.querySelector('em');
        var emHtml = em ? em.outerHTML : '';
        if (story.heading_italic) emHtml = '<em>' + story.heading_italic + '</em>';
        h.innerHTML = story.heading + ' ' + emHtml;
      }
    }
    if (story.intro) {
      var el = document.querySelector('.about-lead, .story-lead');
      if (el) el.textContent = story.intro;
    }
    if (story.body) {
      var el = document.querySelector('.about-body, .story-body');
      if (el) el.textContent = story.body;
    }

    return getGallery('profile').then(function(imgs) {
      if (!imgs.length) return;
      var main = getMain(imgs);
      var imgEl = document.querySelector('.about-visual img, .artist-photo img, .pavi-photo img');
      if (imgEl) {
        setImgSrc(imgEl, main.url, 'Pavi — Makeup Artist Madurai');
      } else {
        var boxEl = document.querySelector('.about-main-box, .about-photo-box');
        if (boxEl) setBg(boxEl, main.url);
      }
    });
  }

  // ══════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════
  function init() {
    getContent().then(function(content) {
      if (PAGE === 'home')     return loadHome(content);
      if (PAGE === 'bridal')   return loadBridal(content);
      if (PAGE === 'party')    return loadParty(content);
      if (PAGE === 'skincare') return loadSkincare(content);
      if (PAGE === 'about')    return loadAbout(content);
    }).catch(function(e) {
      console.warn('[GlowPavi] Loader error:', e.message);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();