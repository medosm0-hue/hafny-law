/* =========================================================
   مكتب محمود حفني — الوظائف التفاعلية العامة
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const posts = Array.isArray(window.POSTS) ? window.POSTS.slice() : [];
  const categoryClass = {
    "أحكام استثنائية": "badge--ruling",
    "العدالة": "badge--justice",
    "استشارات قانونية": "badge--advice"
  };

  const dateFormatter = new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  function formatDate(iso) {
    const date = new Date(iso + "T12:00:00");
    return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
  }

  function readingTime(body) {
    const text = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(" ").length : 0;
    return Math.max(2, Math.ceil(words / 180));
  }

  function articleUrl(slug) {
    return "article.html?slug=" + encodeURIComponent(slug);
  }

  function badge(category) {
    const cls = categoryClass[category] || "";
    return '<span class="badge ' + cls + '">' + category + "</span>";
  }

  const icons = {
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>'
  };

  function postCard(post, index) {
    const mins = readingTime(post.body);
    return (
      '<article class="post-card reveal" style="--delay:' + (index % 6) * 0.06 + 's">' +
        '<div class="post-card__top">' +
          badge(post.category) +
          '<time class="post-card__date" datetime="' + post.date + '">' + formatDate(post.date) + "</time>" +
        "</div>" +
        "<h3><a href=\"" + articleUrl(post.slug) + "\">" + post.title + "</a></h3>" +
        '<p class="post-card__excerpt">' + post.excerpt + "</p>" +
        '<div class="post-card__foot">' +
          '<a class="post-card__read" href="' + articleUrl(post.slug) + '">اقرأ المقال ' + icons.arrow + "</a>" +
          '<span class="post-card__time">' + icons.clock + mins + " دقائق</span>" +
        "</div>" +
      "</article>"
    );
  }

  function rulingCard(post) {
    const mins = readingTime(post.body);
    return (
      '<article class="ruling-card reveal">' +
        badge(post.category) +
        "<h3><a href=\"" + articleUrl(post.slug) + "\">" + post.title + "</a></h3>" +
        "<p>" + post.excerpt + "</p>" +
        '<a class="post-card__read" href="' + articleUrl(post.slug) + '">قراءة التحليل ' + icons.arrow +
          '<span class="post-card__time" style="margin-inline-start:10px">' + mins + " دقائق</span>" +
        "</a>" +
      "</article>"
    );
  }

  /* ---------- Reveal on scroll ---------- */
  let revealObserver = null;

  function observeReveals() {
    const items = document.querySelectorAll(".reveal:not(.is-visible):not([data-observed])");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
    }

    items.forEach(function (el) {
      el.setAttribute("data-observed", "true");
      revealObserver.observe(el);
    });
  }

  /* ---------- Blog list ---------- */
  const grid = document.getElementById("posts-grid");
  const empty = document.getElementById("posts-empty");
  const filters = document.querySelectorAll(".chip[data-filter]");
  const search = document.getElementById("post-search");
  const state = { filter: "all", query: "" };

  function renderPosts() {
    if (!grid) return;

    const query = state.query.trim().toLowerCase();
    const filtered = posts.filter(function (post) {
      const matchesCategory = state.filter === "all" || post.category === state.filter;
      const haystack = (post.title + " " + post.excerpt + " " + post.body).toLowerCase();
      return matchesCategory && (!query || haystack.indexOf(query) !== -1);
    });

    grid.innerHTML = filtered.map(postCard).join("");
    if (empty) empty.hidden = filtered.length !== 0;
    observeReveals();
  }

  if (grid) {
    renderPosts();

    filters.forEach(function (button) {
      button.addEventListener("click", function () {
        filters.forEach(function (item) {
          item.classList.toggle("is-active", item === button);
        });
        state.filter = button.getAttribute("data-filter");
        renderPosts();
      });
    });

    if (search) {
      search.addEventListener("input", function () {
        state.query = search.value;
        renderPosts();
      });
    }
  }

  /* ---------- Featured rulings ---------- */
  const rulingsGrid = document.getElementById("rulings-grid");
  if (rulingsGrid) {
    const rulings = posts.filter(function (post) {
      return post.category === "أحكام استثنائية";
    }).slice(0, 3);
    rulingsGrid.innerHTML = rulings.map(rulingCard).join("");
  }

  /* ---------- Header / navigation ---------- */
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "فتح القائمة");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      const isOpen = navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("is-open")) return;
      if (navMenu.contains(event.target) || navToggle.contains(event.target)) return;
      closeMenu();
    });
  }

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);

    const topButton = document.getElementById("back-to-top");
    if (topButton) topButton.classList.toggle("is-visible", y > 560);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const topButton = document.getElementById("back-to-top");
  if (topButton) {
    topButton.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Active section in nav ---------- */
  const sectionLinks = Array.prototype.slice.call(
    document.querySelectorAll('#nav-menu a[href^="#"]')
  );
  const sections = sectionLinks
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window && !document.body.classList.contains("article-page")) {
    const sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          sectionLinks.forEach(function (link) {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- Contact form -> office email ---------- */
  const OFFICE_EMAIL = "mahmoudhafny.law@gmail.com";
  const form = document.getElementById("contact-form");
  if (form) {
    const status = document.getElementById("form-status");
    const submit = form.querySelector('button[type="submit"]');
    const submitLabel = submit ? submit.querySelector("span") : null;

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      status.className = "form-status" + (state ? " is-" + state : "");
    }

    form.addEventListener("input", function (event) {
      if (event.target.classList) event.target.classList.remove("is-invalid");
      if (status && status.textContent) setStatus("", "");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const required = Array.prototype.slice.call(form.querySelectorAll("[required]"));
      let firstInvalid = null;

      required.forEach(function (field) {
        if (!field.value.trim()) {
          field.classList.add("is-invalid");
          if (!firstInvalid) firstInvalid = field;
        }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const type = String(data.get("type") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (submit) {
        submit.disabled = true;
        submit.setAttribute("aria-busy", "true");
      }
      if (submitLabel) submitLabel.textContent = "جارٍ الإرسال...";
      setStatus("جارٍ إرسال الطلب...", "");

      fetch("https://formsubmit.co/ajax/" + OFFICE_EMAIL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          "نوع الاستشارة": type,
          "ملخص الموضوع": message,
          _subject: "طلب استشارة جديد — " + name,
          _template: "table",
          _captcha: "false"
        })
      })
        .then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          return response.json();
        })
        .then(function (result) {
          if (result && String(result.success) === "false") throw new Error("rejected");
          form.reset();
          setStatus("تم إرسال طلبك بنجاح، وسيصل إلى بريد المكتب. سنتواصل معك في أقرب وقت.", "success");
        })
        .catch(function () {
          setStatus("تعذّر إرسال الطلب الآن. حاول مرة أخرى، أو تواصل معنا عبر واتساب.", "error");
        })
        .finally(function () {
          if (submit) {
            submit.disabled = false;
            submit.removeAttribute("aria-busy");
          }
          if (submitLabel) submitLabel.textContent = "إرسال الطلب";
        });
    });
  }

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Observe static reveals ---------- */
  observeReveals();
})();
