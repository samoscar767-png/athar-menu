(function () {
  "use strict";

  const STORAGE_KEY = "athar-menu-data-v1";
  const AUTH_KEY = "athar-admin-auth";
  const API_URL = "/api/menu";
  // Must match the ADMIN_API_TOKEN environment variable set on the Vercel project.
  const ADMIN_API_TOKEN = "REPLACE_WITH_YOUR_ADMIN_TOKEN";

  const IMG = {
    hotCoffee: "https://images.pexels.com/photos/18281420/pexels-photo-18281420.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    icedCoffee: "https://images.pexels.com/photos/38028987/pexels-photo-38028987.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    frappe: "https://images.pexels.com/photos/17558646/pexels-photo-17558646.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    matcha: "https://images.pexels.com/photos/33094644/pexels-photo-33094644.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    smoothie: "https://images.pexels.com/photos/7190366/pexels-photo-7190366.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    mojito: "https://images.pexels.com/photos/37662775/pexels-photo-37662775.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    croissant: "https://images.pexels.com/photos/21207660/pexels-photo-21207660.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    dessert: "https://images.pexels.com/photos/34623625/pexels-photo-34623625.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
  };

  function v(label, price, image, labelAr) {
    var variant = { label: label, price: price };
    if (image) variant.image = image;
    if (labelAr) variant.labelAr = labelAr;
    return variant;
  }

  const demo = {
    sections: [
      { id: 1, name: "Classic Coffee", nameAr: "القهوة الكلاسيكية", description: "hot & simple", descriptionAr: "ساخنة وبسيطة", active: true, order: 0 },
      { id: 2, name: "Specialty Lattes", nameAr: "لاتيه مميز", description: "hot, iced, blended or canned", descriptionAr: "ساخن، بارد، مخلوط أو معلب", active: true, order: 1 },
      { id: 3, name: "Iced Frappe", nameAr: "فرابيه بارد", description: "blended & cold", descriptionAr: "مخلوط وبارد", active: true, order: 2 },
      { id: 4, name: "Matcha", nameAr: "ماتشا", description: "vibrant green tea", descriptionAr: "شاي أخضر منعش", active: true, order: 3 },
      { id: 5, name: "Smoothies", nameAr: "سموذي", description: "fresh fruit blends", descriptionAr: "مزيج فواكه طازجة", active: true, order: 4 },
      { id: 6, name: "Mojito", nameAr: "موهيتو", description: "mint & refreshing", descriptionAr: "نعناع ومنعش", active: true, order: 5 },
      { id: 7, name: "Bakery", nameAr: "مخبوزات", description: "fresh baked croissants", descriptionAr: "كرواسون طازج", active: true, order: 6 },
      { id: 8, name: "Dessert", nameAr: "حلويات", description: "sweet treats", descriptionAr: "حلويات لذيذة", active: true, order: 7 }
    ],
    items: [
      { id: 1, sectionId: 1, name: "Double Espresso", nameAr: "إسبريسو مزدوج", description: "pure strong coffee", descriptionAr: "قهوة قوية نقية", image: IMG.hotCoffee, available: true, featured: true, variants: [v("Hot", 60, null, "ساخن")] },
      { id: 2, sectionId: 1, name: "Single Turkish Coffee", nameAr: "قهوة تركية مفردة", description: "traditional turkish brew", descriptionAr: "قهوة تركية تقليدية", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 45, null, "ساخن")] },
      { id: 3, sectionId: 1, name: "Double Turkish Coffee", nameAr: "قهوة تركية مزدوجة", description: "extra strong turkish brew", descriptionAr: "قهوة تركية قوية جداً", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 55, null, "ساخن")] },
      { id: 4, sectionId: 1, name: "Americano", nameAr: "أمريكانو", description: "espresso + hot water", descriptionAr: "إسبريسو + ماء ساخن", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 70, null, "ساخن")] },
      { id: 5, sectionId: 1, name: "Cappuccino", nameAr: "كابوتشينو", description: "espresso + steamed milk foam", descriptionAr: "إسبريسو + رغوة حليب", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 95, null, "ساخن")] },
      { id: 6, sectionId: 1, name: "Latte", nameAr: "لاتيه", description: "espresso + lots of milk + little foam", descriptionAr: "إسبريسو + حليب كثير + رغوة قليلة", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 95, null, "ساخن")] },
      { id: 7, sectionId: 1, name: "Flat White", nameAr: "فلات وايت", description: "espresso + thin layer of milk foam", descriptionAr: "إسبريسو + طبقة رقيقة من رغوة الحليب", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 90, null, "ساخن")] },
      { id: 8, sectionId: 1, name: "Cortado", nameAr: "كورتادو", description: "espresso + equal parts warm milk", descriptionAr: "إسبريسو + أجزاء متساوية من الحليب الدافئ", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 85, null, "ساخن")] },
      { id: 9, sectionId: 1, name: "Macchiato", nameAr: "ماكياتو", description: "espresso + small milk foam", descriptionAr: "إسبريسو + رغوة حليب صغيرة", image: IMG.hotCoffee, available: true, featured: false, variants: [v("Hot", 70, null, "ساخن")] },

      { id: 10, sectionId: 2, name: "Pistachio Latte", nameAr: "لاتيه فستق", description: "espresso + pistachio cream", descriptionAr: "إسبريسو + كريمة فستق", image: IMG.icedCoffee, available: true, featured: true, variants: [v("Hot", 135, IMG.hotCoffee, "ساخن"), v("Iced", 135, IMG.icedCoffee, "بارد"), v("Blend", 135, IMG.frappe, "مخلوط"), v("Can", 135, IMG.icedCoffee, "معلب")] },
      { id: 11, sectionId: 2, name: "Spanish Latte", nameAr: "لاتيه إسباني", description: "espresso + condensed milk", descriptionAr: "إسبريسو + حليب مكثف", image: IMG.icedCoffee, available: true, featured: false, variants: [v("Hot", 120, IMG.hotCoffee, "ساخن"), v("Iced", 120, IMG.icedCoffee, "بارد"), v("Blend", 120, IMG.frappe, "مخلوط"), v("Can", 120, IMG.icedCoffee, "معلب")] },
      { id: 12, sectionId: 2, name: "Dark Mocha", nameAr: "موكا داكن", description: "espresso + dark chocolate + milk", descriptionAr: "إسبريسو + شوكولاتة داكنة + حليب", image: IMG.icedCoffee, available: true, featured: false, variants: [v("Hot", 110, IMG.hotCoffee, "ساخن"), v("Iced", 110, IMG.icedCoffee, "بارد"), v("Blend", 110, IMG.frappe, "مخلوط"), v("Can", 110, IMG.icedCoffee, "معلب")] },
      { id: 13, sectionId: 2, name: "Dolce Latte", nameAr: "لاتيه دولتشي", description: "espresso + sweet milk blend", descriptionAr: "إسبريسو + مزيج حليب حلو", image: IMG.icedCoffee, available: true, featured: false, variants: [v("Hot", 125, IMG.hotCoffee, "ساخن"), v("Iced", 125, IMG.icedCoffee, "بارد"), v("Blend", 125, IMG.frappe, "مخلوط"), v("Can", 125, IMG.icedCoffee, "معلب")] },
      { id: 14, sectionId: 2, name: "White Mocha", nameAr: "موكا أبيض", description: "espresso + white chocolate + milk", descriptionAr: "إسبريسو + شوكولاتة بيضاء + حليب", image: IMG.icedCoffee, available: true, featured: false, variants: [v("Hot", 110, IMG.hotCoffee, "ساخن"), v("Iced", 110, IMG.icedCoffee, "بارد"), v("Blend", 110, IMG.frappe, "مخلوط"), v("Can", 110, IMG.icedCoffee, "معلب")] },
      { id: 15, sectionId: 2, name: "Salted Caramel", nameAr: "كراميل مملح", description: "espresso + salted caramel + milk", descriptionAr: "إسبريسو + كراميل مملح + حليب", image: IMG.icedCoffee, available: true, featured: false, variants: [v("Hot", 125, IMG.hotCoffee, "ساخن"), v("Iced", 125, IMG.icedCoffee, "بارد"), v("Blend", 125, IMG.frappe, "مخلوط"), v("Can", 125, IMG.icedCoffee, "معلب")] },

      { id: 16, sectionId: 3, name: "Caramel Coffee Frappe", nameAr: "فرابيه قهوة بالكراميل", description: "blended coffee + caramel", descriptionAr: "قهوة مخلوطة + كراميل", image: IMG.frappe, available: true, featured: false, variants: [v("Frappe", 125, null, "فرابيه")] },
      { id: 17, sectionId: 3, name: "Chocolate Coffee Frappe", nameAr: "فرابيه قهوة بالشوكولاتة", description: "blended coffee + chocolate", descriptionAr: "قهوة مخلوطة + شوكولاتة", image: IMG.frappe, available: true, featured: false, variants: [v("Frappe", 125, null, "فرابيه")] },
      { id: 18, sectionId: 3, name: "Lotus Coffee Frappe", nameAr: "فرابيه قهوة لوتس", description: "blended coffee + lotus biscoff", descriptionAr: "قهوة مخلوطة + لوتس بيسكوف", image: IMG.frappe, available: true, featured: false, variants: [v("Frappe", 125, null, "فرابيه")] },

      { id: 19, sectionId: 4, name: "Matcha Latte", nameAr: "ماتشا لاتيه", description: "matcha + milk", descriptionAr: "ماتشا + حليب", image: IMG.matcha, available: true, featured: true, variants: [v("Hot", 120, IMG.hotCoffee, "ساخن"), v("Iced", 120, IMG.icedCoffee, "بارد"), v("Blend", 120, IMG.frappe, "مخلوط"), v("Can", 120, IMG.icedCoffee, "معلب")] },
      { id: 20, sectionId: 4, name: "Spanish Matcha", nameAr: "ماتشا إسباني", description: "matcha + condensed milk", descriptionAr: "ماتشا + حليب مكثف", image: IMG.matcha, available: true, featured: false, variants: [v("Hot", 135, IMG.hotCoffee, "ساخن"), v("Iced", 135, IMG.icedCoffee, "بارد"), v("Blend", 135, IMG.frappe, "مخلوط"), v("Can", 135, IMG.icedCoffee, "معلب")] },
      { id: 21, sectionId: 4, name: "Pistachio Matcha", nameAr: "ماتشا فستق", description: "matcha + pistachio cream", descriptionAr: "ماتشا + كريمة فستق", image: IMG.matcha, available: true, featured: false, variants: [v("Hot", 155, IMG.hotCoffee, "ساخن"), v("Iced", 155, IMG.icedCoffee, "بارد"), v("Blend", 155, IMG.frappe, "مخلوط"), v("Can", 155, IMG.icedCoffee, "معلب")] },
      { id: 22, sectionId: 4, name: "Mango Matcha", nameAr: "ماتشا مانجو", description: "matcha + mango puree", descriptionAr: "ماتشا + فراولة مانجو", image: IMG.matcha, available: true, featured: false, variants: [v("Hot", 140, IMG.hotCoffee, "ساخن"), v("Iced", 140, IMG.icedCoffee, "بارد"), v("Blend", 140, IMG.frappe, "مخلوط"), v("Can", 140, IMG.icedCoffee, "معلب")] },
      { id: 23, sectionId: 4, name: "Strawberry Matcha", nameAr: "ماتشا فراولة", description: "matcha + strawberry puree", descriptionAr: "ماتشا + فراولة", image: IMG.matcha, available: true, featured: false, variants: [v("Hot", 140, IMG.hotCoffee, "ساخن"), v("Iced", 140, IMG.icedCoffee, "بارد"), v("Blend", 140, IMG.frappe, "مخلوط"), v("Can", 140, IMG.icedCoffee, "معلب")] },
      { id: 24, sectionId: 4, name: "White Chocolate Matcha", nameAr: "ماتشا شوكولاتة بيضاء", description: "matcha + white chocolate", descriptionAr: "ماتشا + شوكولاتة بيضاء", image: IMG.matcha, available: true, featured: false, variants: [v("Hot", 135, IMG.hotCoffee, "ساخن"), v("Iced", 135, IMG.icedCoffee, "بارد"), v("Blend", 135, IMG.frappe, "مخلوط"), v("Can", 135, IMG.icedCoffee, "معلب")] },

      { id: 25, sectionId: 5, name: "Passion Fruit Smoothie", nameAr: "سموذي فاكهة العاطفة", description: "blended passion fruit", descriptionAr: "فاكهة العاطفة مخلوطة", image: IMG.smoothie, available: true, featured: false, variants: [v("Blended", 100, null, "مخلوط")] },
      { id: 26, sectionId: 5, name: "Mango Peach Smoothie", nameAr: "سموذي مانجو وخوخ", description: "blended mango & peach", descriptionAr: "مانجو وخوخ مخلوطين", image: IMG.smoothie, available: true, featured: false, variants: [v("Blended", 100, null, "مخلوط")] },
      { id: 27, sectionId: 5, name: "Blueberry Smoothie", nameAr: "سموذي توت أزرق", description: "blended blueberry", descriptionAr: "توت أزرق مخلوط", image: IMG.smoothie, available: true, featured: false, variants: [v("Blended", 100, null, "مخلوط")] },
      { id: 28, sectionId: 5, name: "Strawberry Mix Berry Smoothie", nameAr: "سموذي فراولة وتوت", description: "blended mixed berries", descriptionAr: "توت مخلوط", image: IMG.smoothie, available: true, featured: false, variants: [v("Blended", 100, null, "مخلوط")] },
      { id: 29, sectionId: 5, name: "Mango Coconut Smoothie", nameAr: "سموذي مانجو وجوز الهند", description: "blended mango & coconut", descriptionAr: "مانجو وجوز الهند مخلوطين", image: IMG.smoothie, available: true, featured: true, variants: [v("Blended", 100, null, "مخلوط")] },
      { id: 30, sectionId: 5, name: "Passion Mango Smoothie", nameAr: "سموذي باشن مانجو", description: "blended passion fruit & mango", descriptionAr: "فاكهة العاطفة والمانجو مخلوطين", image: IMG.smoothie, available: true, featured: false, variants: [v("Blended", 100, null, "مخلوط")] },

      { id: 31, sectionId: 6, name: "Classic Mojito", nameAr: "موهيتو كلاسيكي", description: "mint, lime & soda", descriptionAr: "نعناع، ليمون وصودا", image: IMG.mojito, available: true, featured: false, variants: [v("Iced", 110, null, "بارد")] },
      { id: 32, sectionId: 6, name: "Redbull Mojito", nameAr: "موهيتو ريدبول", description: "mint, lime & energy drink", descriptionAr: "نعناع، ليمون ومشروب طاقة", image: IMG.mojito, available: true, featured: false, variants: [v("Iced", 150, null, "بارد")] },

      { id: 33, sectionId: 7, name: "Plain Croissant", nameAr: "كرواسون عادي", description: "buttery flaky pastry", descriptionAr: "معجنات زبدية مقرمشة", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 75, null, "عادي")] },
      { id: 34, sectionId: 7, name: "Chocolate Croissant", nameAr: "كرواسون بالشوكولاتة", description: "filled with rich chocolate", descriptionAr: "محشو بشوكولاتة غنية", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 95, null, "عادي")] },
      { id: 35, sectionId: 7, name: "Lotus Croissant", nameAr: "كرواسون لوتس", description: "filled with lotus biscoff cream", descriptionAr: "محشو بكريمة لوتس بيسكوف", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 95, null, "عادي")] },
      { id: 36, sectionId: 7, name: "Pistachio Croissant", nameAr: "كرواسون فستق", description: "filled with pistachio cream", descriptionAr: "محشو بكريمة فستق", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 135, null, "عادي")] },
      { id: 37, sectionId: 7, name: "Almond Croissant", nameAr: "كرواسون لوز", description: "topped with almond flakes", descriptionAr: "مغطى برقائق اللوز", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 135, null, "عادي")] },
      { id: 38, sectionId: 7, name: "Cheese Croissant", nameAr: "كرواسون جبنة", description: "filled with creamy cheese", descriptionAr: "محشو بجبنة كريمية", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 95, null, "عادي")] },
      { id: 39, sectionId: 7, name: "Turkey Croissant", nameAr: "كرواسون تركي", description: "savory turkey filling", descriptionAr: "حشوة ديك رومي لذيذة", image: IMG.croissant, available: true, featured: false, variants: [v("Regular", 135, null, "عادي")] },

      { id: 40, sectionId: 8, name: "Cheese Cake", nameAr: "تشيز كيك", description: "creamy classic cheesecake", descriptionAr: "تشيز كيك كلاسيكي كريمي", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 90, null, "عادي")] },
      { id: 41, sectionId: 8, name: "Molten Cake", nameAr: "كيك ذائب", description: "warm gooey chocolate cake", descriptionAr: "كيك شوكولاتة دافئ ولذيذ", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 100, null, "عادي")] },
      { id: 42, sectionId: 8, name: "Honey Cake", nameAr: "كيك العسل", description: "layers of honey sponge", descriptionAr: "طبقات من سبونج العسل", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 85, null, "عادي")] },
      { id: 43, sectionId: 8, name: "Tiramisu", nameAr: "تيراميسو", description: "coffee-soaked mascarpone dessert", descriptionAr: "حلوى ماسكاربوني منقوعة بالقهوة", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 110, null, "عادي")] },
      { id: 44, sectionId: 8, name: "Chocolate Cookies", nameAr: "كوكيز شوكولاتة", description: "double chocolate cookies", descriptionAr: "كوكيز شوكولاتة مزدوجة", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 90, null, "عادي")] },
      { id: 45, sectionId: 8, name: "Cookies Brownie", nameAr: "براوني كوكيز", description: "fudgy brownie with cookie chunks", descriptionAr: "براوني لذيذ مع قطع كوكيز", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 110, null, "عادي")] },
      { id: 46, sectionId: 8, name: "Chocolate Fudge Cake", nameAr: "كيك فادج شوكولاتة", description: "rich chocolate fudge layers", descriptionAr: "طبقات فادج شوكولاتة غنية", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 110, null, "عادي")] },
      { id: 47, sectionId: 8, name: "San Sebastian", nameAr: "سان سيباستيان", description: "burnt basque cheesecake", descriptionAr: "تشيز كيك باسكي محروق", image: IMG.dessert, available: true, featured: false, variants: [v("Regular", 110, null, "عادي")] },
      { id: 48, sectionId: 8, name: "Brownie Affogato", nameAr: "براوني أفوغاتو", description: "brownie topped with espresso shot", descriptionAr: "براوني مع طلقة إسبريسو", image: IMG.dessert, available: true, featured: true, variants: [v("Regular", 125, null, "عادي")] }
    ],
    account: { name: "Athar Admin", email: "admin@athar.com", password: "admin123" }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure the data has the required structure
        if (parsed && parsed.sections && parsed.items && parsed.account) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Could not read saved Athar data, resetting to demo", error);
    }
    // If no valid data found, create fresh demo data
    const fresh = clone(demo);
    save(fresh);
    return fresh;
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent("zad:data-changed"));
    } catch (error) {
      console.warn("Could not save Athar data locally", error);
      return false;
    }

    // Push to the shared server store in the background so every visitor sees the change,
    // not just this browser. The local save above already succeeded either way.
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": ADMIN_API_TOKEN },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) throw new Error("Server responded with " + response.status);
    }).catch(function (error) {
      console.warn("Could not sync Athar data to the server", error);
      window.dispatchEvent(new CustomEvent("zad:sync-error", { detail: { error: error } }));
    });

    return true;
  }

  function syncNow() {
    return fetch(API_URL, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Server responded with " + response.status);
        return response.json();
      })
      .then(function (serverData) {
        if (serverData && serverData.sections && serverData.items && serverData.account) {
          var serialized = JSON.stringify(serverData);
          if (serialized !== localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, serialized);
            window.dispatchEvent(new CustomEvent("zad:data-changed"));
          }
        }
        return serverData;
      })
      .catch(function (error) {
        console.warn("Could not fetch Athar data from the server", error);
      });
  }

  function reset() {
    const fresh = clone(demo);
    save(fresh);
    return fresh;
  }

  function nextId(collection) {
    return collection.length ? Math.max.apply(null, collection.map(function (row) { return Number(row.id) || 0; })) + 1 : 1;
  }

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === "true";
  }

  function login(email, password) {
    try {
      const data = load();
      if (!data || !data.account) {
        console.error("No account data found");
        return false;
      }
      const emailMatch = email.trim().toLowerCase() === data.account.email.toLowerCase();
      const passwordMatch = password === data.account.password;
      const valid = emailMatch && passwordMatch;
      if (valid) {
        sessionStorage.setItem(AUTH_KEY, "true");
      }
      return valid;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
  }

  window.ZadData = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    save: save,
    syncNow: syncNow,
    reset: reset,
    nextId: nextId,
    isAuthenticated: isAuthenticated,
    login: login,
    logout: logout,
    demo: clone(demo)
  };
})();
