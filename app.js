// ============================================================
// Очки — Landing interactions & animations
// - IntersectionObserver scroll-reveal
// - Number counter for price
// - Subtle parallax for hero/final bg
// - Chat bubbles staggered entry
// - Diff slider drag (drag the divider)
// ============================================================

(function () {
  // ── Reveal on scroll ──────────────────────────────────
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  document.querySelectorAll(".reveal, .reveal-scale").forEach((el) => io.observe(el));

  // ── Price counter (hero + final) ──────────────────────
  function animateNumber(el) {
    const target = parseInt(el.dataset.target, 10);
    if (!target) return;
    const dur = 1200;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * ease(t)).toString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(tick);
  }
  const numIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateNumber(e.target);
          numIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.5 },
  );
  document.querySelectorAll("[data-counter]").forEach((el) => numIO.observe(el));

  // ── Diff slider (drag the divider) ────────────────────
  // Each pane is a window onto its own image. The image inside each pane
  // is sized to ALWAYS span the full card width, so as the divider moves
  // both halves of the comparison stay aligned with their original framing.
  const diff = document.querySelector(".diff-card");
  if (diff) {
    const divider = diff.querySelector(".divider");
    const left = diff.querySelector(".pane.left");
    const right = diff.querySelector(".pane.right");
    const leftTag = diff.querySelector(".tag.dark");
    const rightTag = diff.querySelector(".tag.warm");
    let dragging = false;

    function setSplit(percent) {
      const p = Math.max(8, Math.min(92, percent));
      divider.style.left = p + "%";
      left.style.width = p + "%";
      right.style.width = 100 - p + "%";
    }

    function onMove(clientX) {
      const r = diff.getBoundingClientRect();
      const p = ((clientX - r.left) / r.width) * 100;
      setSplit(p);
    }

    // divider.addEventListener('mousedown', (e) => { dragging = true; e.preventDefault(); });
    // divider.addEventListener('touchstart', () => { dragging = true; }, { passive: true });
    window.addEventListener("mousemove", (e) => {
      if (dragging) onMove(e.clientX);
    });
    window.addEventListener(
      "touchmove",
      (e) => {
        if (dragging && e.touches[0]) onMove(e.touches[0].clientX);
      },
      { passive: true },
    );
    window.addEventListener("mouseup", () => {
      dragging = false;
    });
    window.addEventListener("touchend", () => {
      dragging = false;
    });

    diff.addEventListener("click", (e) => {
      if (e.target.closest(".divider") || e.target.closest(".tag")) return;
      onMove(e.clientX);
    });
  }

  // ── Chat bubble stagger entry ─────────────────────────
  const chat = document.querySelector(".chat");
  if (chat) {
    const bubbles = chat.querySelectorAll(".bubble");
    bubbles.forEach((b, i) => {
      b.style.setProperty("--reveal-delay", i * 250 + "ms");
    });
  }

  // ── Daily cards stagger ───────────────────────────────
  document.querySelectorAll(".daily-card").forEach((c, i) => {
    c.style.setProperty("--reveal-delay", i * 120 + "ms");
  });
  document.querySelectorAll(".daily-label").forEach((c, i) => {
    c.style.setProperty("--reveal-delay", i * 120 + 200 + "ms");
  });

  // ── Subtle parallax on hero/final backgrounds (desktop only) ──
  const mqDesktop = window.matchMedia("(min-width: 900px)");
  function attachParallax() {
    if (!mqDesktop.matches) return;
    const targets = document.querySelectorAll(".s-hero, .s-final");
    window.addEventListener(
      "scroll",
      () => {
        const sy = window.scrollY;
        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          const offset = (rect.top * -0.08).toFixed(1);
          el.style.backgroundPositionY = `calc(center + ${offset}px)`;
        });
      },
      { passive: true },
    );
  }
  attachParallax();

  // ── CTA click ripple feedback ─────────────────────────
  document.querySelectorAll(".cta").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.animate([{ transform: "scale(1)" }, { transform: "scale(0.97)" }, { transform: "scale(1)" }], {
        duration: 220,
        easing: "ease-out",
      });
    });
  });

  // ── Product image carousel ────────────────────────────
  document.querySelectorAll(".product[data-images]").forEach((product) => {
    const images = JSON.parse(product.dataset.images);
    if (!images || images.length < 2) return;

    let current = 0;
    const photo = product.querySelector(".photo");
    const prevBtn = product.querySelector(".product-arrow--prev");
    const nextBtn = product.querySelector(".product-arrow--next");
    if (!photo || !prevBtn || !nextBtn) return;

    function switchImage(newIndex) {
      photo.style.opacity = "0";
      setTimeout(() => {
        current = newIndex;
        photo.style.backgroundImage = "url('" + images[current] + "')";
        photo.style.opacity = "1";
      }, 200);
    }

    // Add transition for smooth fade
    photo.style.transition = "opacity 0.2s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

    prevBtn.addEventListener("click", () => {
      const newIndex = (current - 1 + images.length) % images.length;
      switchImage(newIndex);
    });

    nextBtn.addEventListener("click", () => {
      const newIndex = (current + 1) % images.length;
      switchImage(newIndex);
    });
  });
})();

$(document).ready(function () {
  $('[href*="#"]').on("click", function (e) {
    var fixedOffset = 0;
    e.preventDefault();

    $("html, body")
      .stop()
      .animate({ scrollTop: $(this.hash).offset().top + fixedOffset }, 1000);
  });

  $(".order__btn").click(function () {
    const id = $(this).data("id");
    const price = $(this).data("price");
    const currency = $(this).data("currency");
    const name = $(this).data("name");

    $(".modal__name").text(name);
    $(".old__price").text(+price * 2 + " " + currency);
    $(".new__price").text(price + " " + currency);

    $(".modal").find("input[name=products]").val(id);
  });
});
