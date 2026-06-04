// script.js - Sonny Dela Cruz Portfolio
// Complete interactive functionality with GSAP animations

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const smallScreenQuery = window.matchMedia("(max-width: 700px)");
  const canUseHoverEffects = finePointerQuery.matches && !reducedMotionQuery.matches;
  const useLiteMotion =
    reducedMotionQuery.matches || smallScreenQuery.matches || !finePointerQuery.matches;

  // ============================================
  // 1. FOOTER YEAR
  // ============================================
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ============================================
  // 2. OPTIMIZED IMAGE FALLBACKS
  // ============================================
  const supportsWebp = (() => {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.toDataURL &&
        canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0
    );
  })();

  const preloadImage = (src, onLoad, onError) => {
    const image = new Image();
    image.onload = onLoad;
    image.onerror = onError;
    image.src = src;
  };

  const missingOptimizedImages = new Set();

  const upgradeStaticImage = (img) => {
    const webpSrc = img.dataset.webpSrc;
    if (!supportsWebp || !webpSrc || missingOptimizedImages.has(webpSrc)) return;

    preloadImage(webpSrc, () => {
      img.src = webpSrc;
    }, () => {
      missingOptimizedImages.add(webpSrc);
    });
  };

  const optimizedImages = document.querySelectorAll("img[data-webp-src]");
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          upgradeStaticImage(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "360px" }
    );

    optimizedImages.forEach((img) => imageObserver.observe(img));
  } else {
    optimizedImages.forEach(upgradeStaticImage);
  }

  // ============================================
  // 3. THEME TOGGLE (Dark/Light)
  // ============================================
  const themeToggle = document.querySelector(".theme-toggle");
  const html = document.documentElement;
  const savedTheme = localStorage.getItem("theme") || "dark";
  html.setAttribute("data-theme", savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = html.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      
      // Update header background dynamically based on theme
      updateHeaderBackground();
    });
  }

  // Helper function for header background
  function updateHeaderBackground() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const theme = html.getAttribute("data-theme");
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > 50) {
      header.style.background = "var(--bg-secondary)";
    } else {
      if (theme === "light") {
        header.style.background = "rgba(250, 250, 249, 0.5)";
      } else {
        header.style.background = "rgba(9, 9, 12, 0.5)";
      }
    }
  }

  // ============================================
  // 4. CUSTOM CURSOR (Dual-Lerp Animation)
  // ============================================
  const cursor = document.querySelector(".cursor");
  const follower = document.querySelector(".cursor-follower");
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  if (cursor && follower && canUseHoverEffects) {
    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Fast lerp for inner dot
      cursorX += (mouseX - cursorX) * 0.25;
      cursorY += (mouseY - cursorY) * 0.25;
      gsap.set(cursor, { x: cursorX, y: cursorY });
      
      // Slower spring for follower circle
      followerX += (mouseX - followerX) * 0.12;
      followerY += (mouseY - followerY) * 0.12;
      gsap.set(follower, { x: followerX, y: followerY });
      
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover states for cursor
    document.querySelectorAll('[data-cursor="hover"]').forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("hover");
        follower.classList.add("hover");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("hover");
        follower.classList.remove("hover");
      });
    });
  }

  // ============================================
  // 5. TEXT SPLITTER FOR MASK REVEALS
  // ============================================
  const splitText = (el) => {
    if (!el) return;
    const words = el.innerText.trim().split(/\s+/);
    el.innerHTML = words
      .map((word) => `<span class="word-mask"><span class="word-inner">${word}</span></span>`)
      .join(" ");
  };

  // Split hero text elements for animation
  const overline = document.querySelector(".hero .overline");
  const displayTitle = document.querySelector(".hero .display");
  const subtitle = document.querySelector(".hero .subtitle");
  
  splitText(overline);
  splitText(displayTitle);
  splitText(subtitle);

  // ============================================
  // 6. INTRO TIMELINE (Lines + Text Reveals)
  // ============================================
  const introTl = gsap.timeline();

  // Animate structural grid lines
  if (!useLiteMotion) {
    introTl.fromTo(
      ".grid-line-v",
      { height: "0%" },
      { height: "100%", duration: 1.4, ease: "power4.inOut", stagger: 0.15 }
    );
  }

  // Reveal hero text with word-by-word animation
  introTl.to(
    ".hero .overline .word-inner",
    {
      y: "0%",
      duration: useLiteMotion ? 0.35 : 0.8,
      ease: "power3.out",
      stagger: useLiteMotion ? 0.015 : 0.05,
    },
    "-=0.8"
  );
  introTl.to(
    ".hero .display .word-inner",
    {
      y: "0%",
      duration: useLiteMotion ? 0.55 : 1.2,
      ease: useLiteMotion ? "power3.out" : "power4.out",
      stagger: useLiteMotion ? 0.012 : 0.04,
    },
    "-=0.8"
  );
  introTl.to(
    ".hero .subtitle .word-inner",
    {
      y: "0%",
      duration: useLiteMotion ? 0.4 : 0.8,
      ease: "power3.out",
      stagger: useLiteMotion ? 0.01 : 0.03,
    },
    "-=0.9"
  );
  introTl.fromTo(
    ".hero-actions",
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: useLiteMotion ? 0.4 : 0.8, ease: "power3.out" },
    "-=0.6"
  );

  // ============================================
  // 7. ABOUT IMAGE PARALLAX
  // ============================================
  const aboutImg = document.querySelector(".about-image img");
  if (aboutImg && !useLiteMotion) {
    gsap.fromTo(
      aboutImg,
      { yPercent: -8, scale: 1.08 },
      {
        yPercent: 8,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-image",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      }
    );
  }

  // ============================================
  // 8. SCROLL REVEAL ANIMATIONS
  // ============================================
  const reveals = document.querySelectorAll(".reveal:not(.hero *):not(#credentials .reveal)");
  reveals.forEach((el) => {
    gsap.fromTo(
      el,
      { y: useLiteMotion ? 18 : 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: useLiteMotion ? 0.45 : 1.0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: useLiteMotion ? "play none none none" : "play none none reverse",
        },
      }
    );
  });

  // ============================================
  // 9. CREDENTIALS SECTION SCROLL SEQUENCE
  // ============================================
  const credentialsSection = document.querySelector("#credentials");
  if (credentialsSection && !useLiteMotion) {
    const credentialsInfo = credentialsSection.querySelector(".credentials-info");
    const educationTitle = credentialsSection.querySelector(".education-group .credential-group-title");
    const educationTimeline = credentialsSection.querySelector(".education-timeline");
    const educationSteps = credentialsSection.querySelectorAll(".education-step");
    const educationMarkers = credentialsSection.querySelectorAll(".education-marker");
    const certificationTitle = credentialsSection.querySelector(".certification-group .credential-group-title");
    const certificationSlider = credentialsSection.querySelector(".certification-slider");
    const certificationCards = credentialsSection.querySelectorAll(".certification-card");

    if (educationTimeline) {
      gsap.set(educationTimeline, { "--timeline-progress": 0 });
    }

    const credentialsTl = gsap.timeline({
      scrollTrigger: {
        trigger: credentialsSection,
        start: "top 72%",
        toggleActions: "play none none none",
      },
    });

    if (credentialsInfo) {
      credentialsTl.fromTo(
        credentialsInfo,
        { autoAlpha: 0, y: 46 },
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" }
      );
    }

    if (educationTitle) {
      credentialsTl.fromTo(
        educationTitle,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.25"
      );
    }

    if (educationTimeline) {
      credentialsTl
        .fromTo(
          educationTimeline,
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
          "-=0.15"
        )
        .to(
          educationTimeline,
          { "--timeline-progress": 1, duration: 0.75, ease: "power2.out" },
          "-=0.3"
        );
    }

    if (educationSteps.length) {
      credentialsTl.fromTo(
        educationSteps,
        { autoAlpha: 0, y: 34, scale: 0.985 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.62,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform",
        },
        "-=0.55"
      );
    }

    if (educationMarkers.length) {
      credentialsTl.fromTo(
        educationMarkers,
        { autoAlpha: 0, scale: 0 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(2)",
          stagger: 0.08,
          clearProps: "transform",
        },
        "-=0.55"
      );
    }

    if (certificationTitle) {
      credentialsTl.fromTo(
        certificationTitle,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.1"
      );
    }

    if (certificationSlider) {
      credentialsTl.fromTo(
        certificationSlider,
        { autoAlpha: 0, y: 34, clipPath: "inset(0 0 0 18%)" },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(0 0 0 0%)",
          duration: 0.75,
          ease: "power3.out",
        },
        "-=0.2"
      );
    }

    if (certificationCards.length) {
      credentialsTl.fromTo(
        certificationCards,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.38,
          ease: "power3.out",
          stagger: 0.025,
          clearProps: "transform",
        },
        "-=0.55"
      );
    }
  }

  // ============================================
  // 10. PROJECT FLOATING PREVIEW (Image Follower)
  // ============================================
  const preview = document.querySelector(".project-floating-preview");
  const previewImg = preview ? preview.querySelector(".preview-img") : null;
  const previewItems = document.querySelectorAll(
    ".project-row[data-image], .certification-card[data-image]"
  );

  let targetX = 0, targetY = 0;
  let previewX = 0, previewY = 0;

  if (preview && previewImg && canUseHoverEffects) {
    const setPreviewPosition = () => {
      preview.style.setProperty("--preview-x", `${previewX}px`);
      preview.style.setProperty("--preview-y", `${previewY}px`);
    };

    // Animation loop for floating preview position
    const updatePreview = () => {
      previewX += (targetX - previewX) * 0.28;
      previewY += (targetY - previewY) * 0.28;
      setPreviewPosition();
      requestAnimationFrame(updatePreview);
    };
    updatePreview();

    document.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    previewItems.forEach((item) => {
      item.addEventListener("mouseenter", (event) => {
        targetX = event.clientX;
        targetY = event.clientY;
        const imgUrl = item.dataset.image;
        if (imgUrl) {
          previewImg.src = imgUrl;
          previewImg.alt = item.dataset.previewAlt || "";
          const webpUrl = item.dataset.imageWebp;
          if (supportsWebp && webpUrl && !missingOptimizedImages.has(webpUrl)) {
            preloadImage(webpUrl, () => {
              previewImg.src = webpUrl;
            }, () => {
              missingOptimizedImages.add(webpUrl);
            });
          }
        }
        const isCertificatePreview = item.classList.contains("certification-card");
        preview.classList.toggle("certificate-preview", isCertificatePreview);
        previewX = targetX;
        previewY = targetY;
        setPreviewPosition();
        preview.classList.add("active");
      });
      item.addEventListener("mouseleave", () => {
        preview.classList.remove("active");
        window.setTimeout(() => {
          if (!preview.classList.contains("active")) {
            preview.classList.remove("certificate-preview");
          }
        }, 180);
      });
    });
  }

  // ============================================
  // 11. PROJECT ROW LINKS
  // ============================================
  const clickableProjectRows = document.querySelectorAll(".project-row");
  clickableProjectRows.forEach((row) => {
    const link = row.querySelector(".project-link[href]");
    const href = link ? link.getAttribute("href") : "";
    const hasRealLink = href && href !== "#";

    if (!hasRealLink) return;

    row.setAttribute("role", "link");
    row.setAttribute("tabindex", "0");

    const openProjectLink = () => {
      const target = link.getAttribute("target");
      if (target === "_blank") {
        window.open(href, "_blank", "noopener,noreferrer");
        return;
      }
      window.location.href = href;
    };

    row.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      openProjectLink();
    });

    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProjectLink();
    });
  });

  // ============================================
  // 12. PROJECT CATEGORY FILTER (with animations)
  // ============================================
  const filterBtns = document.querySelectorAll(".filter-btn");
  const rows = document.querySelectorAll(".project-row");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active button state
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filter = btn.dataset.filter;
      const activeRows = [];

      rows.forEach((row) => {
        const match = filter === "all" || row.dataset.category === filter;
        
        if (match) {
          row.style.display = "grid";
          activeRows.push(row);
          gsap.fromTo(
            row,
            { opacity: 0, y: 15 },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power3.out",
              clearProps: "all"
            }
          );
        } else {
          gsap.to(row, {
            opacity: 0,
            y: -15,
            duration: 0.4,
            ease: "power3.out",
            onComplete: () => {
              row.style.display = "none";
            },
          });
        }
      });
    });
  });

  // ============================================
  // 13. MAGNETIC BUTTONS EFFECT
  // ============================================
  const magneticEls = document.querySelectorAll(".logo, .theme-toggle, .btn");
  if (canUseHoverEffects) {
    magneticEls.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Magnetic pull with 35% influence
        gsap.to(el, {
          x: x * 0.35,
          y: y * 0.35,
          duration: 0.3,
          ease: "power2.out",
        });
      });

      el.addEventListener("mouseleave", () => {
        // Elastic return to center
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "elastic.out(1.1, 0.4)",
        });
      });
    });
  }

  // ============================================
  // 11. STICKY HEADER (Always Visible)
  // ============================================
  const header = document.querySelector(".site-header");

  let headerTicking = false;
  window.addEventListener("scroll", () => {
    if (headerTicking) return;
    headerTicking = true;
    requestAnimationFrame(() => {
      if (header) {
        header.style.transform = "translateY(0)";
        header.style.borderColor = "var(--border)";
        updateHeaderBackground();
      }
      headerTicking = false;
    });
  });

  // ============================================
  // 12. SMOOTH ANCHOR SCROLLING (GSAP ScrollToPlugin)
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute("href");
      if (targetId && targetId !== "#") {
        const target = document.querySelector(targetId);
        if (target) {
          gsap.to(window, {
            duration: 0.28,
            scrollTo: { y: target, offsetY: 70 },
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    });
  });

  // ============================================
  // 13. CONTACT FORM HANDLER (Demo)
  // ============================================
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.querySelector(".form-status");

  if (contactForm && formStatus) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name")?.value || "";
      const email = document.getElementById("email")?.value || "";
      const message = document.getElementById("message")?.value || "";
      
      if (name && email && message) {
        formStatus.textContent = "✓ Message sent successfully! (Demo)";
        formStatus.style.color = "var(--accent)";
        contactForm.reset();
        
        // Clear status after 3 seconds
        setTimeout(() => {
          formStatus.textContent = "";
        }, 3000);
      } else {
        formStatus.textContent = "✗ Please fill in all fields.";
        formStatus.style.color = "#ff4444";
        
        setTimeout(() => {
          if (formStatus.textContent === "✗ Please fill in all fields.") {
            formStatus.textContent = "";
          }
        }, 3000);
      }
    });
  }

  // ============================================
  // 14. CERTIFICATION SLIDER PAUSE ON HOVER
  // ============================================
  const certSlider = document.querySelector(".certification-slider");
  const certTrack = document.querySelector(".certification-track");
  
  if (certSlider && certTrack && canUseHoverEffects) {
    certSlider.addEventListener("mouseenter", () => {
      certTrack.style.animationPlayState = "paused";
    });
    certSlider.addEventListener("mouseleave", () => {
      certTrack.style.animationPlayState = "running";
    });
  }

  if (certSlider && certTrack) {
    const mobileCertCards = certSlider.querySelectorAll(
      ".certification-loop:not([aria-hidden]) .certification-card"
    );

    if (mobileCertCards.length > 1) {
      const dots = document.createElement("div");
      dots.className = "certification-dots";
      dots.setAttribute("aria-label", "Certificate slide controls");

      const dotButtons = Array.from(mobileCertCards, (_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "certification-dot";
        dot.setAttribute("aria-label", `Show certificate ${index + 1}`);
        dot.addEventListener("click", () => {
          certTrack.scrollTo({
            left: mobileCertCards[index].offsetLeft,
            behavior: "smooth",
          });
        });
        dots.appendChild(dot);
        return dot;
      });

      certSlider.appendChild(dots);

      const setActiveDot = (activeIndex) => {
        dotButtons.forEach((dot, index) => {
          dot.classList.toggle("active", index === activeIndex);
          dot.setAttribute("aria-current", index === activeIndex ? "true" : "false");
        });
      };

      const getActiveCertificateIndex = () => {
        const firstCard = mobileCertCards[0];
        const secondCard = mobileCertCards[1];
        const step = secondCard
          ? secondCard.offsetLeft - firstCard.offsetLeft
          : firstCard.offsetWidth;
        return Math.max(
          0,
          Math.min(mobileCertCards.length - 1, Math.round(certTrack.scrollLeft / step))
        );
      };

      let certDotTicking = false;
      certTrack.addEventListener("scroll", () => {
        if (certDotTicking) return;
        certDotTicking = true;
        requestAnimationFrame(() => {
          setActiveDot(getActiveCertificateIndex());
          certDotTicking = false;
        });
      });

      setActiveDot(0);
    }
  }

  // ============================================
  // 15. INITIAL HEADER BACKGROUND SETUP
  // ============================================
  updateHeaderBackground();

  // ============================================
  // 16. REFRESH SCROLLTRIGGER (for dynamic content)
  // ============================================
  ScrollTrigger.refresh();
  
  // Optional: Small delay to ensure all images are loaded
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
  });
});
