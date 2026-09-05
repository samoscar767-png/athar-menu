(function () {
  "use strict";

  // Wait for data.js to load
  var store = window.ZadData;
  if (!store) {
    console.error("ZadData not loaded! Make sure data.js is included before admin.js");
    return;
  }

  var data = store.load();
  if (store.syncNow) store.syncNow();
  var currentView = "overview";
  var itemSearch = "";
  var itemSection = "all";
  var confirmCallback = null;
  var itemImage = "";
  var itemVariants = [];
  var promoImage = "";

  var app = document.getElementById("admin-app");
  var loginScreen = document.getElementById("login-screen");
  var content = document.getElementById("admin-content");
  var topbarTitle = document.getElementById("topbar-title");

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeImage(value) {
    var url = String(value || "");
    return /^(https?:\/\/|data:image\/|\.\/|\/)/i.test(url) ? escapeHtml(url) : "";
  }

  function formatEGP(value) {
    var number = Number(value) || 0;
    return (number % 1 === 0 ? number.toFixed(0) : number.toFixed(2)) + " EGP";
  }

  function priceSummary(item) {
    var variants = item.variants || [];
    if (!variants.length) return "—";
    if (variants.length === 1) return formatEGP(variants[0].price);
    var prices = variants.map(function (row) { return Number(row.price) || 0; });
    var min = Math.min.apply(null, prices);
    var max = Math.max.apply(null, prices);
    return min === max ? formatEGP(min) : "from " + formatEGP(min);
  }

  function getSection(id) {
    return data.sections.find(function (section) { return section.id === Number(id); });
  }

  function persist(message) {
    var saved = store.save(data);
    if (saved && message) toast(message, "success");
    if (!saved) toast("Browser storage is full. Try a smaller image.", "error");
    return saved;
  }

  function toast(message, type) {
    var stack = document.getElementById("toast-stack");
    var element = document.createElement("div");
    element.className = "toast " + (type || "success");
    element.textContent = message;
    stack.appendChild(element);
    setTimeout(function () { element.remove(); }, 3200);
  }

  function showLogin() {
    app.hidden = true;
    loginScreen.hidden = false;
  }

  function showApp() {
    loginScreen.hidden = true;
    app.hidden = false;
    updateAccountUI();
    navigate(currentView, false);
  }

  function updateAccountUI() {
    var letter = (data.account.name || "A").charAt(0).toUpperCase();
    document.getElementById("admin-name").textContent = data.account.name;
    document.getElementById("admin-email").textContent = data.account.email;
    document.getElementById("admin-avatar").textContent = letter;
    document.getElementById("top-avatar").textContent = letter;
  }

  function skeleton() {
    content.innerHTML = '<div class="loading-grid"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>';
  }

  function navigate(view, animate) {
    currentView = view;
    var titles = { overview: "Overview", sections: "Menu Categories", items: "Menu Items", settings: "Settings" };
    topbarTitle.textContent = titles[view] || "Dashboard";
    document.querySelectorAll("[data-view]").forEach(function (button) {
      button.classList.toggle("active", button.dataset.view === view);
    });
    document.getElementById("sidebar").classList.remove("open");

    if (animate !== false) {
      skeleton();
      setTimeout(renderCurrentView, 170);
    } else {
      renderCurrentView();
    }
  }

  function renderCurrentView() {
    data = store.load();
    if (currentView === "overview") renderOverview();
    if (currentView === "sections") renderSections();
    if (currentView === "items") renderItems();
    if (currentView === "settings") renderSettings();
  }

  function emptyState(icon, title, copyText, actionLabel, actionName) {
    return '<div class="empty-state"><div><div class="empty-icon" style="margin:auto">' + icon + '</div><h3>' + escapeHtml(title) + '</h3><p>' + escapeHtml(copyText) + '</p>' +
      (actionLabel ? '<button class="btn" type="button" data-action="' + actionName + '">＋ ' + escapeHtml(actionLabel) + "</button>" : "") + "</div></div>";
  }

  function renderOverview() {
    var available = data.items.filter(function (item) { return item.available; }).length;
    var featured = data.items.filter(function (item) { return item.featured; }).length;
    var recent = data.items.slice().sort(function (a, b) { return (b.created || b.id) - (a.created || a.id); }).slice(0, 6);
    var sections = data.sections.slice().sort(function (a, b) { return a.order - b.order; });

    var recentHtml = recent.length ? recent.map(function (item) {
      var section = getSection(item.sectionId);
      var image = safeImage(item.image);
      return '<div class="recent-row">' +
        (image ? '<img src="' + image + '" alt="">' : '<span style="width:46px;height:46px;display:grid;place-items:center;border-radius:11px;background:var(--cream-2)">☕</span>') +
        '<div><h4>' + escapeHtml(item.name) + '</h4><p>' + escapeHtml(section ? section.name : "No category") + "</p></div>" +
        '<div style="text-align:right"><span class="recent-price">' + priceSummary(item) + '</span><br><span class="badge ' + (item.available ? "green" : "red") + '">' + (item.available ? "In stock" : "Sold out") + "</span></div>" +
      "</div>";
    }).join("") : '<div style="padding:35px;text-align:center;color:var(--muted);font-size:12px">No items yet.</div>';

    var sectionHtml = sections.length ? sections.map(function (section) {
      var count = data.items.filter(function (item) { return item.sectionId === section.id; }).length;
      return '<div class="summary-row"><span class="emoji">' + escapeHtml(section.emoji || "☕") + '</span><div><h4>' + escapeHtml(section.name) + '</h4><p>' + count + " item" + (count === 1 ? "" : "s") + '</p></div>' + (!section.active ? '<span class="badge amber">Hidden</span>' : "") + "</div>";
    }).join("") : '<div style="padding:35px;text-align:center;color:var(--muted);font-size:12px">No categories yet.</div>';

    content.innerHTML = '<div class="page-head"><div><h1>Dashboard</h1><p>A quick look at the Athar menu.</p></div><button class="btn" type="button" data-action="add-item">＋ Add item</button></div>' +
      '<section class="stats-grid">' +
        statCard("☷", data.sections.length, "Menu categories") +
        statCard("♨", data.items.length, "Menu items") +
        statCard("✓", available, "Available now") +
        statCard("✦", featured, "Featured items") +
      "</section>" +
      '<div class="dashboard-grid">' +
        '<section class="panel"><header class="panel-head"><h2>Recently added</h2><button type="button" data-action="go-items">View all →</button></header><div class="recent-list">' + recentHtml + "</div></section>" +
        '<section class="panel"><header class="panel-head"><h2>Menu categories</h2><button type="button" data-action="go-sections">Manage →</button></header><div class="section-summary">' + sectionHtml + "</div></section>" +
      "</div>";
  }

  function statCard(icon, number, label) {
    return '<article class="stat-card"><div class="stat-card-top"><span class="stat-icon">' + icon + '</span><span style="color:#baa89e">↗</span></div><div class="stat-number">' + number + '</div><div class="stat-label">' + label + "</div></article>";
  }

  function renderItems() {
    var needle = itemSearch.trim().toLocaleLowerCase();
    var sections = data.sections.slice().sort(function (a, b) { return a.order - b.order; });
    var filtered = data.items.filter(function (item) {
      if (itemSection !== "all" && String(item.sectionId) !== itemSection) return false;
      if (!needle) return true;
      var section = getSection(item.sectionId);
      return [item.name, item.description, section && section.name].some(function (value) {
        return String(value || "").toLocaleLowerCase().includes(needle);
      });
    });

    var options = '<option value="all">All categories</option>' + sections.map(function (section) {
      return '<option value="' + section.id + '" ' + (itemSection === String(section.id) ? "selected" : "") + '>' + escapeHtml((section.emoji || "☕") + " " + section.name) + "</option>";
    }).join("");

    var cards = "";
    if (!data.items.length) {
      cards = emptyState("♨", "No menu items yet", "Add your first menu item with a price and photo.", "Add your first item", "add-item");
    } else if (!filtered.length) {
      cards = emptyState("⌕", "No matching items", "Try a different search or clear the category filter.", "Clear filters", "clear-filters");
    } else {
      cards = filtered.map(function (item) {
        var section = getSection(item.sectionId);
        var image = safeImage(item.image);
        var variantCount = (item.variants || []).length;
        var siblings = data.items.filter(function (row) { return row.sectionId === item.sectionId; });
        var posInSection = siblings.findIndex(function (row) { return row.id === item.id; });
        var orderButtons = '<div class="order-buttons" title="Arrange within ' + escapeHtml(section ? section.name : "category") + '"><button class="action-button" type="button" data-move-item="' + item.id + '" data-direction="-1" ' + (posInSection === 0 ? "disabled" : "") + '>↑</button><button class="action-button" type="button" data-move-item="' + item.id + '" data-direction="1" ' + (posInSection === siblings.length - 1 ? "disabled" : "") + ">↓</button></div>";
        return '<article class="admin-item-card">' +
          '<div class="admin-item-image">' +
            (image ? '<img src="' + image + '" alt="' + escapeHtml(item.name) + '">' : '<div style="height:100%;display:grid;place-items:center;font-size:38px;color:var(--coffee)">☕</div>') +
            '<div class="card-flags">' + (item.featured ? '<span class="badge amber">✦ Featured</span>' : "<span></span>") + (!item.available ? '<span class="badge red">Sold out</span>' : "") + "</div>" +
          "</div>" +
          '<div class="admin-item-info"><div class="admin-item-title"><div><h3>' + escapeHtml(item.name) + '</h3><div class="ar-name" style="color:var(--muted,#8a7a6b);font-size:11px">' + variantCount + " variant" + (variantCount === 1 ? "" : "s") + '</div></div><span class="price">' + priceSummary(item) + "</span></div>" +
            '<div class="section-name">' + escapeHtml(section ? section.name : "No category") + '</div><p class="description">' + escapeHtml(item.description) + "</p>" +
            '<div class="card-actions"><div class="stock-toggle"><button class="switch ' + (item.available ? "active" : "") + '" type="button" data-toggle-stock="' + item.id + '"></button><span>' + (item.available ? "In stock" : "Sold out") + '</span></div><div class="action-buttons">' + orderButtons + '<button class="action-button star ' + (item.featured ? "active" : "") + '" type="button" data-toggle-featured="' + item.id + '" title="Toggle featured">✦</button><button class="action-button" type="button" data-edit-item="' + item.id + '" title="Edit">✎</button><button class="action-button delete" type="button" data-delete-item="' + item.id + '" title="Delete">⌫</button></div></div>' +
          "</div></article>";
      }).join("");
    }

    content.innerHTML = '<div class="page-head"><div><h1>Menu Items</h1><p>Edit names, variants, prices and photos — changes appear on the customer page.</p></div><button class="btn" type="button" data-action="add-item">＋ Add item</button></div>' +
      '<div class="admin-toolbar"><div class="search-box"><span style="position:absolute;inset-inline-start:15px;top:10px;color:#9c8679">⌕</span><input class="control" id="item-search" placeholder="Search items…" value="' + escapeHtml(itemSearch) + '"></div><select class="control" id="item-section-filter">' + options + "</select></div>" +
      '<section class="admin-items-grid">' + cards + "</section>";

    document.getElementById("item-search").addEventListener("input", function () {
      itemSearch = this.value;
      renderItems();
      var field = document.getElementById("item-search");
      field.focus();
      field.setSelectionRange(field.value.length, field.value.length);
    });
    document.getElementById("item-section-filter").addEventListener("change", function () {
      itemSection = this.value;
      renderItems();
    });
  }

  function renderSections() {
    var sections = data.sections.slice().sort(function (a, b) { return a.order - b.order; });
    var cards = sections.length ? sections.map(function (section, index) {
      var count = data.items.filter(function (item) { return item.sectionId === section.id; }).length;
      return '<article class="section-admin-card"><div class="section-card-head"><span class="emoji">' + escapeHtml(section.emoji || "☕") + '</span><div><h3>' + escapeHtml(section.name) + '</h3></div><div class="order-buttons"><button class="action-button" data-move-section="' + section.id + '" data-direction="-1" ' + (index === 0 ? "disabled" : "") + '>↑</button><button class="action-button" data-move-section="' + section.id + '" data-direction="1" ' + (index === sections.length - 1 ? "disabled" : "") + ">↓</button></div></div>" +
        '<p class="section-description">' + escapeHtml(section.description || "No tagline") + '</p><footer class="section-card-footer"><div><span class="badge">' + count + " item" + (count === 1 ? "" : "s") + "</span> " + (!section.active ? '<span class="badge amber">Hidden</span>' : "") + '</div><div class="action-buttons"><button class="action-button" type="button" data-edit-section="' + section.id + '">✎</button><button class="action-button delete" type="button" data-delete-section="' + section.id + '">⌫</button></div></footer></article>';
    }).join("") : emptyState("☷", "No categories yet", "Create your first category, such as Specialty Lattes or Bakery.", "Create a category", "add-section");

    content.innerHTML = '<div class="page-head"><div><h1>Menu Categories</h1><p>Organise the menu into tabs shown on the site.</p></div><button class="btn" type="button" data-action="add-section">＋ Add category</button></div><section class="sections-grid">' + cards + "</section>";
  }

  function renderSettings() {
    var promo = data.promo || {};
    promoImage = promo.image || "";
    content.innerHTML = '<div class="page-head"><div><h1>Settings</h1><p>Update the admin account or restore the sample content.</p></div></div>' +
      '<section class="settings-card"><header class="settings-head"><span class="stat-icon">⚿</span><div><h2>Account settings</h2><p>These credentials are stored in this browser only.</p></div></header>' +
      '<form class="settings-form" id="settings-form"><div class="field-grid"><div class="field"><label for="settings-name">Display name</label><input class="control" id="settings-name" value="' + escapeHtml(data.account.name) + '"></div><div class="field"><label for="settings-email">Email</label><input class="control" id="settings-email" type="email" value="' + escapeHtml(data.account.email) + '"></div></div><div class="field-grid"><div class="field"><label for="settings-password">New password</label><input class="control" id="settings-password" type="password" minlength="6" placeholder="Leave blank to keep current"></div><div class="field"><label for="settings-confirm">Confirm password</label><input class="control" id="settings-confirm" type="password" minlength="6"></div></div><button class="btn" type="submit">Save account</button></form></section>' +

      '<section class="settings-card" style="margin-top:16px"><header class="settings-head"><span class="stat-icon">✦</span><div><h2>Promo banner</h2><p>The "New addition" banner shown on the homepage, between the menu and the footer.</p></div></header>' +
      '<form class="settings-form" id="promo-form" style="padding:20px">' +
        '<div class="toggle-row" style="padding-bottom:14px;border-bottom:1px solid var(--cream-line,#e7ddd0);margin-bottom:14px"><div><b>Show on homepage</b><small>Turn off to hide the banner without losing its content</small></div><button class="switch ' + (promo.active !== false ? "active" : "") + '" id="promo-active" type="button" aria-label="Toggle promo banner visibility"></button></div>' +
        '<div style="display:grid;grid-template-columns:220px 1fr;gap:24px">' +
          '<div>' +
            '<div class="field"><label>Photo</label></div>' +
            '<label class="upload-box" for="promo-image-file">' +
              '<div class="upload-placeholder" id="promo-upload-placeholder"' + (promoImage ? " hidden" : "") + '><span style="font-size:28px">▧</span><b>Click to upload an image</b><small>JPG, PNG or WEBP</small></div>' +
              '<img id="promo-image-preview" alt="Promo preview" ' + (promoImage ? 'src="' + escapeHtml(promoImage) + '"' : "hidden") + '>' +
              '<input id="promo-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif">' +
            '</label>' +
            '<div class="image-actions"><button class="btn btn-secondary btn-small" id="remove-promo-image" type="button">Remove image</button></div>' +
            '<div class="field" style="margin-top:12px"><label for="promo-image-url">Or paste an image URL</label><input class="control" id="promo-image-url" type="url" placeholder="https://…" dir="ltr" value="' + (/^https?:/i.test(promoImage) ? escapeHtml(promoImage) : "") + '"></div>' +
          '</div>' +
          '<div class="form-stack">' +
            '<div class="field-grid"><div class="field"><label for="promo-name">Drink name</label><input class="control" id="promo-name" dir="ltr" value="' + escapeHtml(promo.name || "") + '"></div><div class="field"><label for="promo-name-ar">Drink name (Arabic)</label><input class="control" id="promo-name-ar" dir="rtl" value="' + escapeHtml(promo.nameAr || "") + '"></div></div>' +
            '<div class="field-grid"><div class="field"><label for="promo-desc">Description</label><textarea class="control" id="promo-desc" dir="ltr">' + escapeHtml(promo.description || "") + '</textarea></div><div class="field"><label for="promo-desc-ar">Description (Arabic)</label><textarea class="control" id="promo-desc-ar" dir="rtl">' + escapeHtml(promo.descriptionAr || "") + '</textarea></div></div>' +
            '<div class="field-grid"><div class="field"><label for="promo-price">Price (EGP)</label><input class="control" id="promo-price" type="number" min="0" step="0.01" value="' + (promo.price != null ? promo.price : "") + '"></div><div class="field"><label for="promo-old-price">Old price (optional)</label><input class="control" id="promo-old-price" type="number" min="0" step="0.01" value="' + (promo.oldPrice != null ? promo.oldPrice : "") + '"></div></div>' +
            '<div class="field"><label for="promo-discount">Discount % badge (optional)</label><input class="control" id="promo-discount" type="number" min="0" max="100" step="1" style="max-width:140px" value="' + (promo.discount != null ? promo.discount : "") + '"></div>' +
            '<div class="field-grid"><div class="field"><label for="promo-tag-title">Highlight title</label><input class="control" id="promo-tag-title" dir="ltr" placeholder="Fresh" value="' + escapeHtml(promo.tagTitle || "") + '"></div><div class="field"><label for="promo-tag-title-ar">Highlight title (Arabic)</label><input class="control" id="promo-tag-title-ar" dir="rtl" placeholder="طازج" value="' + escapeHtml(promo.tagTitleAr || "") + '"></div></div>' +
            '<div class="field-grid"><div class="field"><label for="promo-tag-sub">Highlight subtext</label><input class="control" id="promo-tag-sub" dir="ltr" placeholder="mango + coconut + ice" value="' + escapeHtml(promo.tagSub || "") + '"></div><div class="field"><label for="promo-tag-sub-ar">Highlight subtext (Arabic)</label><input class="control" id="promo-tag-sub-ar" dir="rtl" placeholder="مانجو + جوز هند + ثلج" value="' + escapeHtml(promo.tagSubAr || "") + '"></div></div>' +
          '</div>' +
        '</div>' +
        '<button class="btn" type="submit" style="margin-top:16px">Save promo banner</button>' +
      '</form></section>' +

      '<section class="settings-card" style="margin-top:16px"><header class="settings-head"><span class="stat-icon" style="background:var(--red-bg)">↻</span><div><h2>Reset demo content</h2><p>Restore all sample categories, items and login credentials.</p></div></header><div style="padding:20px"><button class="btn btn-danger" type="button" data-action="reset-demo">Reset everything</button></div></section>';

    document.getElementById("settings-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var name = document.getElementById("settings-name").value.trim();
      var email = document.getElementById("settings-email").value.trim();
      var password = document.getElementById("settings-password").value;
      var confirm = document.getElementById("settings-confirm").value;
      if (!name || !email) return toast("Name and email are required.", "error");
      if (password && password.length < 6) return toast("Password must have at least 6 characters.", "error");
      if (password !== confirm) return toast("Passwords do not match.", "error");
      data.account.name = name;
      data.account.email = email;
      if (password) data.account.password = password;
      persist("Account settings saved");
      updateAccountUI();
      renderSettings();
    });

    function updatePromoImagePreview() {
      var preview = document.getElementById("promo-image-preview");
      var placeholder = document.getElementById("promo-upload-placeholder");
      if (promoImage) {
        preview.src = promoImage;
        preview.hidden = false;
        placeholder.hidden = true;
      } else {
        preview.removeAttribute("src");
        preview.hidden = true;
        placeholder.hidden = false;
      }
    }

    document.getElementById("promo-active").addEventListener("click", function () { this.classList.toggle("active"); });

    document.getElementById("promo-image-file").addEventListener("change", function () {
      var file = this.files && this.files[0];
      var input = this;
      if (!file) return;
      var fileName = file.name;
      resizeImage(file, function (result) {
        toast("Uploading image…");
        input.disabled = true;
        store.uploadImage(result, fileName)
          .then(function (url) {
            promoImage = url;
            document.getElementById("promo-image-url").value = "";
            updatePromoImagePreview();
            toast("Image uploaded");
          })
          .catch(function (error) {
            console.error("Promo image upload failed", error);
            toast("Image upload failed. Using local preview instead.", "error");
            promoImage = result;
            document.getElementById("promo-image-url").value = "";
            updatePromoImagePreview();
          })
          .then(function () { input.disabled = false; });
      });
      this.value = "";
    });

    document.getElementById("promo-image-url").addEventListener("input", function () {
      if (this.value.trim()) {
        promoImage = this.value.trim();
        updatePromoImagePreview();
      }
    });

    document.getElementById("remove-promo-image").addEventListener("click", function () {
      promoImage = "";
      document.getElementById("promo-image-url").value = "";
      updatePromoImagePreview();
    });

    document.getElementById("promo-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var imageUrl = document.getElementById("promo-image-url").value.trim();
      if (imageUrl) promoImage = imageUrl;
      var oldPriceRaw = document.getElementById("promo-old-price").value.trim();
      var discountRaw = document.getElementById("promo-discount").value.trim();
      data.promo = {
        active: document.getElementById("promo-active").classList.contains("active"),
        name: document.getElementById("promo-name").value.trim(),
        nameAr: document.getElementById("promo-name-ar").value.trim(),
        description: document.getElementById("promo-desc").value.trim(),
        descriptionAr: document.getElementById("promo-desc-ar").value.trim(),
        price: Number(document.getElementById("promo-price").value) || 0,
        oldPrice: oldPriceRaw ? Number(oldPriceRaw) : null,
        discount: discountRaw ? Number(discountRaw) : null,
        tagTitle: document.getElementById("promo-tag-title").value.trim(),
        tagTitleAr: document.getElementById("promo-tag-title-ar").value.trim(),
        tagSub: document.getElementById("promo-tag-sub").value.trim(),
        tagSubAr: document.getElementById("promo-tag-sub-ar").value.trim(),
        image: promoImage
      };
      persist("Promo banner saved");
      renderSettings();
    });
  }

  function fillSectionSelect(selected) {
    var select = document.getElementById("item-section");
    var sections = data.sections.slice().sort(function (a, b) { return a.order - b.order; });
    select.innerHTML = sections.map(function (section) {
      return '<option value="' + section.id + '" ' + (Number(selected) === section.id ? "selected" : "") + '>' + escapeHtml((section.emoji || "☕") + " " + section.name) + "</option>";
    }).join("");
  }

  function setSwitch(id, active) {
    document.getElementById(id).classList.toggle("active", Boolean(active));
  }

  function renderVariantRows() {
    var container = document.getElementById("item-variants");
    if (!itemVariants.length) {
      container.innerHTML = '<div class="variants-empty">No variants yet — add at least one (e.g. Hot, Iced, Blend, Can).</div>';
      return;
    }
    container.innerHTML = itemVariants.map(function (variant, index) {
      var image = variant.image || "";
      return '<div class="variant-edit-row" data-index="' + index + '">' +
        '<div class="variant-label">' +
          '<input class="control" data-field="label" placeholder="Label (Hot)" value="' + escapeHtml(variant.label || "") + '" dir="ltr">' +
          '<input class="control" data-field="labelAr" placeholder="Label (Arabic) — اختياري" value="' + escapeHtml(variant.labelAr || "") + '" dir="rtl">' +
        '</div>' +
        '<input class="control" data-field="price" type="number" min="0" step="0.01" placeholder="Price" value="' + (variant.price != null ? variant.price : "") + '">' +
        '<div class="variant-photo">' +
          '<div class="variant-photo-row">' +
            '<label class="variant-photo-thumb-wrap" title="Upload a photo for this variant">' +
              (image ? '<img class="variant-photo-thumb" src="' + escapeHtml(image) + '" alt="">' : '<span>▧</span>') +
              '<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden data-variant-file="' + index + '">' +
            '</label>' +
            '<input class="control variant-photo-url" data-field="image" type="url" placeholder="or paste photo URL" value="' + escapeHtml(image) + '" dir="ltr">' +
          '</div>' +
          (image ? '<button type="button" class="variant-photo-clear" data-clear-variant-image="' + index + '">Remove photo</button>' : '') +
        '</div>' +
        '<button class="action-button delete" type="button" data-remove-variant="' + index + '" title="Remove variant">✕</button>' +
      "</div>";
    }).join("");

    container.querySelectorAll(".variant-edit-row").forEach(function (row) {
      var index = Number(row.dataset.index);

      row.querySelectorAll("[data-field]").forEach(function (field) {
        field.addEventListener("input", function () {
          itemVariants[index][field.dataset.field] = this.value;
        });
      });

      var fileInput = row.querySelector("[data-variant-file]");
      if (fileInput) {
        fileInput.addEventListener("change", function () {
          var file = this.files && this.files[0];
          if (!file) return;
          var fileName = file.name;
          resizeImage(file, function (result) {
            toast("Uploading variant photo…");
            store.uploadImage(result, fileName)
              .then(function (url) {
                itemVariants[index].image = url;
                renderVariantRows();
                toast("Variant photo uploaded");
              })
              .catch(function (error) {
                console.error("Variant image upload failed", error);
                toast("Upload failed. Using local preview instead.", "error");
                itemVariants[index].image = result;
                renderVariantRows();
              });
          });
        });
      }

      var clearBtn = row.querySelector("[data-clear-variant-image]");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          itemVariants[index].image = "";
          renderVariantRows();
        });
      }
    });
  }

  function openItemModal(id) {
    if (!data.sections.length) {
      toast("Create a category before adding an item.", "error");
      navigate("sections");
      return;
    }
    var item = id ? data.items.find(function (row) { return row.id === Number(id); }) : null;
    document.getElementById("item-modal-title").textContent = item ? "Edit menu item" : "Add a menu item";
    document.getElementById("item-id").value = item ? item.id : "";
    fillSectionSelect(item ? item.sectionId : data.sections.slice().sort(function (a, b) { return a.order - b.order; })[0].id);
    document.getElementById("item-name").value = item ? item.name : "";
    document.getElementById("item-name-ar").value = item ? (item.nameAr || "") : "";
    document.getElementById("item-description").value = item ? item.description : "";
    document.getElementById("item-description-ar").value = item ? (item.descriptionAr || "") : "";
    itemImage = item ? item.image : "";
    document.getElementById("item-image-url").value = item && /^https?:/i.test(item.image || "") ? item.image : "";
    updateImagePreview();
    itemVariants = item && item.variants && item.variants.length
      ? item.variants.map(function (row) { return { label: row.label, labelAr: row.labelAr || "", price: row.price, image: row.image || "" }; })
      : [{ label: "Regular", labelAr: "", price: "", image: "" }];
    renderVariantRows();
    setSwitch("item-available", item ? item.available : true);
    setSwitch("item-featured", item ? item.featured : false);
    openModal("item-modal");
  }

  function updateImagePreview() {
    var preview = document.getElementById("item-image-preview");
    var placeholder = document.getElementById("upload-placeholder");
    if (itemImage) {
      preview.src = itemImage;
      preview.hidden = false;
      placeholder.hidden = true;
    } else {
      preview.removeAttribute("src");
      preview.hidden = true;
      placeholder.hidden = false;
    }
  }

  function saveItem() {
    var form = document.getElementById("item-form");
    if (!form.reportValidity()) return;

    var cleanVariants = itemVariants
      .map(function (row) {
        return {
          label: String(row.label || "").trim(),
          labelAr: String(row.labelAr || "").trim(),
          price: Number(row.price) || 0,
          image: String(row.image || "").trim()
        };
      })
      .filter(function (row) { return row.label; })
      .map(function (row) {
        var out = { label: row.label, price: row.price };
        if (row.labelAr) out.labelAr = row.labelAr;
        if (row.image) out.image = row.image;
        return out;
      });

    if (!cleanVariants.length) return toast("Add at least one variant with a label.", "error");

    var id = Number(document.getElementById("item-id").value);
    var imageUrl = document.getElementById("item-image-url").value.trim();
    if (imageUrl) itemImage = imageUrl;
    var values = {
      sectionId: Number(document.getElementById("item-section").value),
      name: document.getElementById("item-name").value.trim(),
      nameAr: document.getElementById("item-name-ar").value.trim(),
      description: document.getElementById("item-description").value.trim(),
      descriptionAr: document.getElementById("item-description-ar").value.trim(),
      image: itemImage,
      variants: cleanVariants,
      available: document.getElementById("item-available").classList.contains("active"),
      featured: document.getElementById("item-featured").classList.contains("active")
    };
    if (id) {
      var index = data.items.findIndex(function (item) { return item.id === id; });
      data.items[index] = Object.assign({}, data.items[index], values);
      persist("Menu item updated");
    } else {
      values.id = store.nextId(data.items);
      values.created = Date.now();
      data.items.unshift(values);
      persist("Menu item added");
    }
    closeModal("item-modal");
    renderCurrentView();
  }

  function openSectionModal(id) {
    var section = id ? data.sections.find(function (row) { return row.id === Number(id); }) : null;
    document.getElementById("section-modal-title").textContent = section ? "Edit category" : "Add a category";
    document.getElementById("section-id").value = section ? section.id : "";
    document.getElementById("section-emoji").value = section ? (section.emoji || "☕") : "☕";
    document.getElementById("section-name").value = section ? section.name : "";
    document.getElementById("section-name-ar").value = section ? (section.nameAr || "") : "";
    document.getElementById("section-description").value = section ? section.description : "";
    document.getElementById("section-description-ar").value = section ? (section.descriptionAr || "") : "";
    setSwitch("section-active", section ? section.active : true);
    openModal("section-modal");
  }

  function saveSection() {
    var form = document.getElementById("section-form");
    if (!form.reportValidity()) return;
    var id = Number(document.getElementById("section-id").value);
    var values = {
      emoji: document.getElementById("section-emoji").value.trim() || "☕",
      name: document.getElementById("section-name").value.trim(),
      nameAr: document.getElementById("section-name-ar").value.trim(),
      description: document.getElementById("section-description").value.trim(),
      descriptionAr: document.getElementById("section-description-ar").value.trim(),
      active: document.getElementById("section-active").classList.contains("active")
    };
    if (id) {
      var index = data.sections.findIndex(function (section) { return section.id === id; });
      data.sections[index] = Object.assign({}, data.sections[index], values);
      persist("Category updated");
    } else {
      values.id = store.nextId(data.sections);
      values.order = data.sections.length;
      data.sections.push(values);
      persist("Category added");
    }
    closeModal("section-modal");
    renderCurrentView();
  }

  function openModal(id) {
    document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(function (modal) {
      if (modal.id !== id) modal.hidden = true;
    });
    document.getElementById(id).hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal(id) {
    document.getElementById(id).hidden = true;
    document.body.style.overflow = "";
  }

  function confirmAction(title, text, buttonText, callback) {
    document.getElementById("confirm-title").textContent = title;
    document.getElementById("confirm-text").textContent = text;
    document.getElementById("confirm-action").textContent = buttonText;
    confirmCallback = callback;
    openModal("confirm-modal");
  }

  function resizeImage(file, callback) {
    if (!file.type.startsWith("image/")) return toast("Please choose an image file.", "error");
    if (file.size > 8 * 1024 * 1024) return toast("Image must be smaller than 8 MB.", "error");
    var reader = new FileReader();
    reader.onload = function (event) {
      var image = new Image();
      image.onload = function () {
        var max = 1100;
        var ratio = Math.min(1, max / Math.max(image.width, image.height));
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * ratio);
        canvas.height = Math.round(image.height * ratio);
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        callback(canvas.toDataURL("image/jpeg", .78));
      };
      image.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  // LOGIN FORM HANDLER
  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var emailInput = document.getElementById("login-email");
      var passwordInput = document.getElementById("login-password");
      var errorDiv = document.getElementById("login-error");

      if (!emailInput || !passwordInput) return;

      var email = emailInput.value;
      var password = passwordInput.value;
      var submitBtn = document.getElementById("login-btn");

      if (submitBtn) submitBtn.disabled = true;

      store.login(email, password).then(function (valid) {
        if (errorDiv) errorDiv.hidden = valid;
        if (valid) {
          data = store.load();
          showApp();
        }
      }).finally(function () {
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  } else {
    console.error("Login form not found!");
  }

  // LOGOUT BUTTON
  var logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      store.logout();
      showLogin();
    });
  }

  // NAVIGATION
  document.querySelectorAll("[data-view]").forEach(function (button) {
    button.addEventListener("click", function () { navigate(button.dataset.view); });
  });
  
  var viewLink = document.querySelector("[data-view-link]");
  if (viewLink) {
    viewLink.addEventListener("click", function (event) {
      event.preventDefault();
      navigate("overview");
    });
  }
  
  var sidebarToggle = document.getElementById("sidebar-toggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("open");
    });
  }

  // CONTENT CLICK HANDLER
  content.addEventListener("click", function (event) {
    var target = event.target.closest("button");
    if (!target) return;
    var action = target.dataset.action;
    if (action === "add-item") openItemModal();
    if (action === "add-section") openSectionModal();
    if (action === "go-items") navigate("items");
    if (action === "go-sections") navigate("sections");
    if (action === "clear-filters") { itemSearch = ""; itemSection = "all"; renderItems(); }
    if (action === "reset-demo") askReset();

    if (target.dataset.editItem) openItemModal(target.dataset.editItem);
    if (target.dataset.editSection) openSectionModal(target.dataset.editSection);

    if (target.dataset.toggleStock) {
      var item = data.items.find(function (row) { return row.id === Number(target.dataset.toggleStock); });
      item.available = !item.available;
      persist();
      renderItems();
      toast(item.available ? "Item marked in stock" : "Item marked sold out");
    }
    if (target.dataset.toggleFeatured) {
      var item2 = data.items.find(function (row) { return row.id === Number(target.dataset.toggleFeatured); });
      item2.featured = !item2.featured;
      persist();
      renderItems();
      toast(item2.featured ? "Item featured" : "Item removed from featured");
    }
    if (target.dataset.deleteItem) {
      var id = Number(target.dataset.deleteItem);
      var item3 = data.items.find(function (row) { return row.id === id; });
      confirmAction("Delete item?", '"' + item3.name + '" will be permanently removed from the menu.', "Delete item", function () {
        data.items = data.items.filter(function (row) { return row.id !== id; });
        persist("Item deleted");
        renderItems();
      });
    }
    if (target.dataset.deleteSection) {
      var id2 = Number(target.dataset.deleteSection);
      var section = data.sections.find(function (row) { return row.id === id2; });
      var count = data.items.filter(function (item) { return item.sectionId === id2; }).length;
      confirmAction("Delete category?", '"' + section.name + '" and its ' + count + " item(s) will be removed.", "Delete category", function () {
        data.sections = data.sections.filter(function (row) { return row.id !== id2; });
        data.items = data.items.filter(function (item) { return item.sectionId !== id2; });
        persist("Category deleted");
        renderSections();
      });
    }
    if (target.dataset.moveItem) {
      var movedId = Number(target.dataset.moveItem);
      var direction2 = Number(target.dataset.direction);
      var movedItem = data.items.find(function (row) { return row.id === movedId; });
      var siblingItems = data.items.filter(function (row) { return row.sectionId === movedItem.sectionId; });
      var itemPos = siblingItems.indexOf(movedItem);
      var swapItem = siblingItems[itemPos + direction2];
      if (swapItem) {
        var itemIndex1 = data.items.indexOf(movedItem);
        var itemIndex2 = data.items.indexOf(swapItem);
        data.items[itemIndex1] = swapItem;
        data.items[itemIndex2] = movedItem;
        persist();
        renderItems();
      }
    }
    if (target.dataset.moveSection) {
      var ordered = data.sections.slice().sort(function (a, b) { return a.order - b.order; });
      var index = ordered.findIndex(function (row) { return row.id === Number(target.dataset.moveSection); });
      var next = index + Number(target.dataset.direction);
      if (next >= 0 && next < ordered.length) {
        var temp = ordered[index].order;
        ordered[index].order = ordered[next].order;
        ordered[next].order = temp;
        persist();
        renderSections();
      }
    }
  });

  // ITEM MODAL CLICK HANDLER
  // The item modal (#item-modal) lives outside #admin-content in the DOM,
  // so clicks on "Add variant" / "Remove variant" never reached the
  // #admin-content listener above. Handling them here on the modal itself
  // fixes that.
  var itemModal = document.getElementById("item-modal");
  if (itemModal) {
    itemModal.addEventListener("click", function (event) {
      var target = event.target.closest("button");
      if (!target) return;
      if (target.id === "add-variant") {
        itemVariants.push({ label: "", labelAr: "", price: "", image: "" });
        renderVariantRows();
      }
      if (target.dataset.removeVariant !== undefined) {
        itemVariants.splice(Number(target.dataset.removeVariant), 1);
        renderVariantRows();
      }
    });
  }

  // MODAL BUTTONS
  var saveItemBtn = document.getElementById("save-item");
  if (saveItemBtn) saveItemBtn.addEventListener("click", saveItem);
  
  var saveSectionBtn = document.getElementById("save-section");
  if (saveSectionBtn) saveSectionBtn.addEventListener("click", saveSection);
  
  var itemAvailableBtn = document.getElementById("item-available");
  if (itemAvailableBtn) itemAvailableBtn.addEventListener("click", function () { this.classList.toggle("active"); });
  
  var itemFeaturedBtn = document.getElementById("item-featured");
  if (itemFeaturedBtn) itemFeaturedBtn.addEventListener("click", function () { this.classList.toggle("active"); });
  
  var sectionActiveBtn = document.getElementById("section-active");
  if (sectionActiveBtn) sectionActiveBtn.addEventListener("click", function () { this.classList.toggle("active"); });

  // IMAGE UPLOAD — resize client-side, then upload the file to Vercel Blob
  // storage and use the returned URL (instead of embedding base64 in the
  // saved menu data).
  var imageFileInput = document.getElementById("item-image-file");
  if (imageFileInput) {
    imageFileInput.addEventListener("change", function () {
      var file = this.files && this.files[0];
      var input = this;
      if (!file) return;
      var fileName = file.name;
      resizeImage(file, function (result) {
        toast("Uploading image…");
        input.disabled = true;
        store.uploadImage(result, fileName)
          .then(function (url) {
            itemImage = url;
            document.getElementById("item-image-url").value = "";
            updateImagePreview();
            toast("Image uploaded");
          })
          .catch(function (error) {
            console.error("Image upload failed", error);
            toast("Image upload failed. Using local preview instead.", "error");
            // Fall back to the base64 preview so the admin isn't blocked if
            // /api/upload or the blob store isn't configured yet.
            itemImage = result;
            document.getElementById("item-image-url").value = "";
            updateImagePreview();
          })
          .then(function () {
            input.disabled = false;
          });
      });
      this.value = "";
    });
  }
  
  var imageUrlInput = document.getElementById("item-image-url");
  if (imageUrlInput) {
    imageUrlInput.addEventListener("input", function () {
      if (this.value.trim()) {
        itemImage = this.value.trim();
        updateImagePreview();
      }
    });
  }
  
  var removeImageBtn = document.getElementById("remove-item-image");
  if (removeImageBtn) {
    removeImageBtn.addEventListener("click", function () {
      itemImage = "";
      document.getElementById("item-image-url").value = "";
      updateImagePreview();
    });
  }

  // MODAL CLOSE BUTTONS
  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () { closeModal(button.dataset.closeModal); });
  });
  document.querySelectorAll(".modal-backdrop").forEach(function (backdrop) {
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeModal(backdrop.id);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") document.querySelectorAll(".modal-backdrop:not([hidden])").forEach(function (modal) { closeModal(modal.id); });
  });

  // CONFIRM ACTION
  var confirmActionBtn = document.getElementById("confirm-action");
  if (confirmActionBtn) {
    confirmActionBtn.addEventListener("click", function () {
      var callback = confirmCallback;
      confirmCallback = null;
      closeModal("confirm-modal");
      if (callback) callback();
    });
  }

  // RESET DEMO
  function askReset() {
    confirmAction("Reset demo data?", "All changes, uploaded images and account settings in this browser will be replaced with the original demo content.", "Reset everything", function () {
      data = store.reset();
      updateAccountUI();
      renderCurrentView();
      toast("Demo data restored");
    });
  }
  
  var resetDemoBtn = document.getElementById("reset-demo");
  if (resetDemoBtn) resetDemoBtn.addEventListener("click", askReset);

  // RESET DATA BUTTON ON LOGIN SCREEN
  var resetDataBtn = document.getElementById("reset-data-btn");
  if (resetDataBtn) {
    resetDataBtn.addEventListener("click", function () {
      if (confirm("This will clear all saved data and restore demo content. Continue?")) {
        localStorage.removeItem(store.STORAGE_KEY);
        sessionStorage.removeItem("athar-admin-auth");
        location.reload();
      }
    });
  }

  // INITIAL STATE
  if (store.isAuthenticated()) {
    showApp();
  } else {
    showLogin();
  }

  // Keep the dashboard in sync with the server (e.g. another admin session, or a
  // background sync that pulled newer data), and warn if a save didn't reach the server.
  window.addEventListener("zad:data-changed", function () {
    if (app.hidden) return;
    renderCurrentView();
  });
  window.addEventListener("zad:sync-error", function () {
    toast("Saved on this device, but couldn't sync to the server. Check your connection.", "error");
  });
})();
