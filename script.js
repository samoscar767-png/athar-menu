(function () {
  "use strict";

  var CURRENCY = "EGP";
  var CURRENCY_AR = "ج.م";
  var PAGE_SIZE = 8;
  var currentLang = localStorage.getItem("athar-lang") || "en";

  // Language translations for static UI text
  var translations = {
    en: {
      more: "More",
      thanks: "Thanks for subscribing to Athar updates!",
      footer: "© " + new Date().getFullYear() + " Athar. All rights reserved."
    },
    ar: {
      more: "المزيد",
      thanks: "شكراً لاشتراكك في تحديثات أثر!",
      footer: "© " + new Date().getFullYear() + " أثر. جميع الحقوق محفوظة."
    }
  };

  function buildMenuData() {
    if (!window.ZadData) return [];
    var raw = window.ZadData.load();
    var sections = raw.sections
      .filter(function (section) { return section.active; })
      .sort(function (a, b) { return a.order - b.order; });

    return sections.map(function (section) {
      var items = raw.items
        .filter(function (item) { return item.sectionId === section.id && item.available; })
        .map(function (item) {
          return {
            name: currentLang === "ar" ? (item.nameAr || item.name) : item.name,
            description: currentLang === "ar" ? (item.descriptionAr || item.description) : item.description,
            image: item.image,
            variants: item.variants.map(function (v) {
              return {
                label: currentLang === "ar" ? (v.labelAr || v.label) : v.label,
                price: v.price,
                image: v.image
              };
            })
          };
        });
      return {
        id: "section-" + section.id,
        name: currentLang === "ar" ? (section.nameAr || section.name) : section.name,
        tagline: currentLang === "ar" ? (section.descriptionAr || section.description) : section.description,
        items: items
      };
    });
  }

  var menuData = buildMenuData();

  var state = {
    activeId: menuData.length ? menuData[0].id : null,
    visible: PAGE_SIZE
  };

  function refreshMenuData() {
    menuData = buildMenuData();
    if (!menuData.some(function (cat) { return cat.id === state.activeId; })) {
      state.activeId = menuData.length ? menuData[0].id : null;
    }
    state.visible = PAGE_SIZE;
    renderAll();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getActiveCategory() {
    for (var i = 0; i < menuData.length; i++) {
      if (menuData[i].id === state.activeId) return menuData[i];
    }
    return menuData[0];
  }

  function renderTabs() {
    var tabsEl = document.getElementById("categoryTabs");
    tabsEl.innerHTML = "";
    menuData.forEach(function (cat) {
      var btn = document.createElement("button");
      btn.className = "tab-btn" + (cat.id === state.activeId ? " active" : "");
      btn.textContent = cat.name;
      btn.addEventListener("click", function () {
        state.activeId = cat.id;
        state.visible = PAGE_SIZE;
        renderAll();
        var grid = document.getElementById("menuGrid");
        if (grid) grid.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      tabsEl.appendChild(btn);
    });
  }

  function cardHtml(item) {
    var hasGallery = item.variants.length > 1 && item.variants.every(function (v) { return !!v.image; });
    var defaultImage = hasGallery ? item.variants[0].image : item.image;
    var currency = currentLang === "ar" ? CURRENCY_AR : CURRENCY;

    var priceHtml;
    if (item.variants.length === 1) {
      priceHtml = '<p class="menu-card-price">' + item.variants[0].price + " " + currency + "</p>";
    } else {
      priceHtml =
        '<div class="variant-list">' +
        item.variants
          .map(function (v, i) {
            var imgAttr = hasGallery ? ' data-image="' + v.image + '"' : "";
            var activeClass = hasGallery && i === 0 ? " active" : "";
            return (
              '<div class="variant-row' +
              activeClass +
              '"' +
              imgAttr +
              '><span class="label">' +
              escapeHtml(v.label) +
              '</span><span class="price">' +
              v.price +
              " " +
              currency +
              "</span></div>"
            );
          })
          .join("") +
        "</div>";
    }

    return (
      '<div class="menu-card">' +
      '<div class="menu-card-img"><img src="' +
      defaultImage +
      '" alt="' +
      escapeHtml(item.name) +
      '" loading="lazy" /></div>' +
      '<div class="menu-card-body">' +
      "<div><h3>" +
      escapeHtml(item.name) +
      '</h3><p class="menu-card-desc">' +
      escapeHtml(item.description) +
      "</p></div>" +
      priceHtml +
      "</div>" +
      "</div>"
    );
  }

  function renderGrid() {
    var cat = getActiveCategory();
    var grid = document.getElementById("menuGrid");
    var tagline = document.getElementById("activeTagline");
    var moreWrap = document.getElementById("moreBtn").parentElement;

    tagline.textContent = cat.tagline;

    var items = cat.items.slice(0, state.visible);
    grid.innerHTML = items.map(cardHtml).join("");

    if (state.visible < cat.items.length) {
      moreWrap.classList.remove("hidden");
    } else {
      moreWrap.classList.add("hidden");
    }
  }

  function renderAll() {
    renderTabs();
    renderGrid();
  }

  function initGallery() {
    var grid = document.getElementById("menuGrid");
    grid.addEventListener("click", function (e) {
      var row = e.target.closest(".variant-row[data-image]");
      if (!row) return;

      var card = row.closest(".menu-card");
      var img = card.querySelector(".menu-card-img img");
      img.src = row.getAttribute("data-image");

      row.parentElement.querySelectorAll(".variant-row").forEach(function (r) {
        r.classList.remove("active");
      });
      row.classList.add("active");
    });
  }

  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var nav = document.getElementById("mobileNav");
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
      });
    });
  }

  function initMore() {
    document.getElementById("moreBtn").addEventListener("click", function () {
      state.visible += PAGE_SIZE;
      renderGrid();
    });
  }

  function initNewsletter() {
    var form = document.getElementById("newsletterForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.reset();
      alert(translations[currentLang].thanks);
    });
  }

  function initYear() {
    document.getElementById("footerYear").textContent = translations[currentLang].footer;
  }

  // Language switching
  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("athar-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    // Update all elements with data-en/data-ar attributes
    document.querySelectorAll("[data-en][data-ar]").forEach(function (el) {
      el.textContent = el.getAttribute("data-" + lang);
    });

    // Update placeholders
    document.querySelectorAll("[data-en-placeholder][data-ar-placeholder]").forEach(function (el) {
      el.placeholder = el.getAttribute("data-" + lang + "-placeholder");
    });

    // Update toggle button
    var toggle = document.getElementById("langToggle");
    if (toggle) {
      toggle.setAttribute("data-active-lang", lang);
    }

    // Rebuild menu data with new language
    refreshMenuData();
    initYear();
  }

  function initLangToggle() {
    var toggle = document.getElementById("langToggle");
    if (!toggle) return;

    // Set initial state
    toggle.setAttribute("data-active-lang", currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

    // Apply initial translations
    if (currentLang === "ar") {
      document.querySelectorAll("[data-en][data-ar]").forEach(function (el) {
        el.textContent = el.getAttribute("data-ar");
      });
      document.querySelectorAll("[data-en-placeholder][data-ar-placeholder]").forEach(function (el) {
        el.placeholder = el.getAttribute("data-ar-placeholder");
      });
    }

    toggle.addEventListener("click", function () {
      var newLang = currentLang === "en" ? "ar" : "en";
      setLanguage(newLang);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLangToggle();
    renderAll();
    initGallery();
    initMobileMenu();
    initMore();
    initNewsletter();
    initYear();
  });

  // Keep the menu in sync with the admin dashboard: same-tab edits (custom
  // event) and edits made in another tab (native storage event).
  window.addEventListener("zad:data-changed", refreshMenuData);
  window.addEventListener("storage", function (e) {
    if (!window.ZadData || e.key === window.ZadData.STORAGE_KEY) refreshMenuData();
  });
})();
