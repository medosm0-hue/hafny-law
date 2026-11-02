/* =========================================================
   مكتب محمود حفني — صفحة المقال
   ========================================================= */
(function () {
  "use strict";

  const posts = Array.isArray(window.POSTS) ? window.POSTS : [];
  const slug = new URLSearchParams(window.location.search).get("slug");
  const post = posts.find(function (item) {
    return item.slug === slug;
  });

  const titleEl = document.getElementById("article-title");
  const metaEl = document.getElementById("article-meta");
  const contentEl = document.getElementById("article-content");
  const breadcrumbCategory = document.getElementById("breadcrumb-category");
  const relatedList = document.getElementById("related-list");
  const relatedGrid = document.getElementById("related-grid");
  const progressBar = document.getElementById("reading-progress-bar");

  const categoryClass = {
    "أحكام استثنائية": "badge--ruling",
    "العدالة": "badge--justice",
    "استشارات قانونية": "badge--advice"
  };

  const icons = {
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    author: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>'
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

  function badge(category) {
    return '<span class="badge ' + (categoryClass[category] || "") + '">' + category + "</span>";
  }

  function articleUrl(slugValue) {
    return "article.html?slug=" + encodeURIComponent(slugValue);
  }

  function cardMarkup(item) {
    const mins = readingTime(item.body);
    return (
      '<article class="post-card">' +
        '<div class="post-card__top">' +
          badge(item.category) +
          '<time class="post-card__date" datetime="' + item.date + '">' + formatDate(item.date) + "</time>" +
        "</div>" +
        "<h3><a href=\"" + articleUrl(item.slug) + "\">" + item.title + "</a></h3>" +
        '<p class="post-card__excerpt">' + item.excerpt + "</p>" +
        '<div class="post-card__foot">' +
          '<a class="post-card__read" href="' + articleUrl(item.slug) + '">اقرأ المقال ' + icons.arrow + "</a>" +
          '<span class="post-card__time">' + icons.clock + mins + " دقائق</span>" +
        "</div>" +
      "</article>"
    );
  }

  function renderRelated(current) {
    const sameCategory = posts.filter(function (item) {
      return item.slug !== current.slug && item.category === current.category;
    });
    const others = posts.filter(function (item) {
      return item.slug !== current.slug && item.category !== current.category;
    });
    const related = sameCategory.concat(others).slice(0, 3);

    if (relatedList) {
      relatedList.innerHTML = related
        .map(function (item, index) {
          return (
            "<li>" +
              '<a href="' + articleUrl(item.slug) + '">' +
                '<span class="related-list__num">' + String(index + 1).padStart(2, "0") + "</span>" +
                '<span class="related-list__title">' + item.title + "</span>" +
              "</a>" +
            "</li>"
          );
        })
        .join("");
    }

    if (relatedGrid) {
      relatedGrid.innerHTML = related.map(cardMarkup).join("");
    }
  }

  function updateShare(current) {
    const wa = document.getElementById("share-whatsapp");
    const copyBtn = document.getElementById("copy-link");
    const printBtn = document.getElementById("print-article");
    const pageUrl = window.location.href;
    const shareText = current.title + "\n" + pageUrl;

    if (wa) {
      wa.href = "https://wa.me/?text=" + encodeURIComponent(shareText);
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        const label = copyBtn.querySelector("span");
        const original = label ? label.textContent : "";
        const done = function () {
          if (label) label.textContent = "تم النسخ";
          window.setTimeout(function () {
            if (label) label.textContent = original;
          }, 1800);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(pageUrl).then(done).catch(function () {
            fallbackCopy(pageUrl, done);
          });
        } else {
          fallbackCopy(pageUrl, done);
        }
      });
    }

    if (printBtn) {
      printBtn.addEventListener("click", function () {
        window.print();
      });
    }
  }

  function fallbackCopy(text, callback) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand("copy");
      callback();
    } catch (error) {
      /* لا يمكن النسخ تلقائيًا في هذا المتصفح */
    }
    document.body.removeChild(input);
  }

  function addArticleSchema(current) {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": current.title,
      "description": current.excerpt,
      "datePublished": current.date,
      "inLanguage": "ar",
      "author": {
        "@type": "Organization",
        "name": "مكتب محمود حفني للمحاماة"
      },
      "publisher": {
        "@type": "Organization",
        "name": "مكتب محمود حفني للمحاماة"
      },
      "articleSection": current.category,
      "mainEntityOfPage": window.location.href
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  }

  function showNotFound() {
    if (breadcrumbCategory) breadcrumbCategory.textContent = "غير موجود";
    if (titleEl) titleEl.textContent = "المقال غير موجود";
    if (metaEl) metaEl.innerHTML = "";
    document.title = "المقال غير موجود | مكتب محمود حفني للمحاماة";
    if (contentEl) {
      contentEl.innerHTML =
        "<p>عذرًا، هذا المقال غير متاح أو تم تغيير رابطه. يمكنك العودة إلى المدونة القانونية لقراءة أحدث المقالات.</p>" +
        '<p><a class="btn btn--gold" href="index.html#posts">العودة إلى المدونة</a></p>';
    }
    if (relatedList) relatedList.innerHTML = "";
    if (relatedGrid) {
      relatedGrid.innerHTML = posts.slice(0, 3).map(cardMarkup).join("");
    }
  }

  if (!post) {
    showNotFound();
    return;
  }

  const minutes = readingTime(post.body);

  document.title = post.title + " | مكتب محمود حفني للمحاماة";

  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", post.excerpt);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", post.title);
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", post.excerpt);

  if (breadcrumbCategory) breadcrumbCategory.textContent = post.category;
  if (titleEl) titleEl.textContent = post.title;
  if (metaEl) {
    metaEl.innerHTML =
      badge(post.category) +
      '<span class="meta-pill">' + icons.calendar + formatDate(post.date) + "</span>" +
      '<span class="meta-pill">' + icons.clock + minutes + " دقائق قراءة</span>" +
      '<span class="meta-pill">' + icons.author + "إعداد مكتب محمود حفني</span>";
  }
  if (contentEl) contentEl.innerHTML = post.body;

  renderRelated(post);
  updateShare(post);
  addArticleSchema(post);

  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const current = window.scrollY || doc.scrollTop || 0;
    progressBar.style.width = (max > 0 ? Math.min(100, (current / max) * 100) : 0) + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
})();
