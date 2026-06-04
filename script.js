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
  // 11. PROJECT DETAIL MODAL
  // ============================================
  const projectDetails = {
    "ccdi-career": {
      count: "01 / 04",
      title: "CCDI Automated Career Assessment Test",
      type: "Full Stack",
      shortDescription:
        "AI-assisted student assessment platform that recommends career tracks and supports enrollment decisions for CCDI.",
      stack: ["MongoDB", "React", "Node.js", "Express"],
      image: "ccdi-career.webp",
      imageAlt: "CCDI Automated Career Assessment Test interface",
      site: "https://ccdi-career-assestment.vercel.app",
      github: "https://github.com/koala-bonjing/ccdi-career-assestment",
      overview:
        "This project turns career assessment into a guided digital workflow. Students answer structured questions, the system processes their responses, and the interface presents career-aligned recommendations that are easier for staff and students to review.",
      features: [
        "Student-friendly assessment flow with clear step-by-step progression.",
        "Career recommendation output designed for enrollment support.",
        "Full-stack data handling for storing assessments and results.",
        "Responsive interface for reviewing results across desktop and mobile.",
      ],
      process: [
        "Mapped the assessment journey around how students answer questions and how staff interpret results.",
        "Designed the interface to keep long forms approachable through hierarchy, spacing, and progressive feedback.",
        "Built the MERN workflow around reusable UI patterns and clear API boundaries.",
      ],
    },
    labxchange: {
      count: "02 / 04",
      title: "LabXchange 360",
      type: "Frontend",
      shortDescription:
        "Healthcare laboratory interface focused on secure workflows, role-based access, and reliable patient data handling.",
      stack: ["React", "shadcn/ui", "TanStack Query", "REST APIs"],
      image: "labX.webp",
      imageAlt: "LabXchange 360 dashboard interface",
      site: "",
      github: "",
      overview:
        "LabXchange 360 is a production healthcare LIS interface built for laboratory workflows. The front-end work focused on making complex operational data easier to scan, protect, and act on in a real clinical environment.",
      features: [
        "Role-aware interface patterns for sensitive healthcare operations.",
        "Data-heavy screens structured for fast scanning and reduced mistakes.",
        "Reusable React components connected to RESTful API workflows.",
        "Security-conscious UI behavior for access control and data integrity.",
      ],
      process: [
        "Studied the operational needs of laboratory users before shaping the interface.",
        "Prioritized dense but readable layouts over decorative visuals.",
        "Iterated components around reliability, predictable states, and maintainable front-end structure.",
      ],
    },
    "ccdi-admin": {
      count: "03 / 04",
      title: "CCDI Automated Career Assessment Test - Admin Dashboard",
      type: "Full Stack",
      shortDescription:
        "Administrative dashboard for managing assessments, reviewing student results, and organizing career guidance data.",
      stack: ["MongoDB", "React", "Node.js", "Express", "Mantine UI"],
      image: "admin.webp",
      imageAlt: "CCDI admin dashboard interface",
      site: "https://ccdi-admin-capstone.vercel.app/",
      github: "https://github.com/koala-bonjing/ccdi-admin-capstone",
      overview:
        "The admin dashboard gives staff a central place to manage career assessment data, inspect student outputs, and support decision-making without digging through raw records or disconnected tools.",
      features: [
        "Dashboard views for monitoring assessment activity and results.",
        "Management tools for organizing student career guidance information.",
        "Full-stack CRUD workflows for administrative data handling.",
        "Clean component structure using Mantine UI for consistent controls.",
      ],
      process: [
        "Separated student-facing and admin-facing needs into distinct workflows.",
        "Designed dashboard sections around repeat administrative tasks.",
        "Built the interface with reusable tables, forms, and status patterns to keep the system maintainable.",
      ],
    },
    syncstudy: {
      count: "04 / 04",
      title: "SyncStudy - Peer Study Group Finder",
      type: "Full Stack",
      shortDescription:
        "Peer study group finder that helps students discover, organize, and join study sessions with matching interests.",
      stack: ["React", "Node.js", "Express", "PostgreSQL"],
      image: "tutor-sync.webp",
      imageAlt: "SyncStudy peer study group finder interface",
      site: "",
      github: "",
      overview:
        "SyncStudy is a student collaboration platform concept for connecting learners with study groups that fit their subjects, availability, and goals. The project centers on making peer learning easier to discover and organize.",
      features: [
        "Study group discovery based on shared interests and subjects.",
        "Structured group information for quick comparison and joining.",
        "Backend-ready model for users, groups, and participation data.",
        "Responsive interface suited for students checking opportunities on mobile.",
      ],
      process: [
        "Started with the student problem: finding the right people to study with at the right time.",
        "Shaped the UI around quick comparison, readable group details, and low-friction joining.",
        "Planned the data model around scalable group membership and future scheduling features.",
      ],
    },
  };

  const projectModal = document.getElementById("projectModal");
  const projectModalTitle = document.getElementById("projectModalTitle");
  const projectModalDescription = document.getElementById("projectModalDescription");
  const projectModalType = document.getElementById("projectModalType");
  const projectModalCount = document.getElementById("projectModalCount");
  const projectModalStack = document.getElementById("projectModalStack");
  const projectModalImage = document.getElementById("projectModalImage");
  const projectModalOverview = document.getElementById("projectModalOverview");
  const projectModalFeatures = document.getElementById("projectModalFeatures");
  const projectModalProcess = document.getElementById("projectModalProcess");
  const projectModalSite = document.getElementById("projectModalSite");
  const projectModalGithub = document.getElementById("projectModalGithub");
  const projectModalPanel = projectModal?.querySelector(".project-modal-panel");
  let projectModalLastFocus = null;

  const renderList = (target, items) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };

  const renderStack = (target, items) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<span>${item}</span>`).join("");
  };

  const setModalAction = (link, url) => {
    if (!link) return;
    if (url) {
      link.href = url;
      link.classList.remove("is-disabled");
      link.removeAttribute("aria-disabled");
      link.removeAttribute("tabindex");
      return;
    }

    link.href = "#";
    link.classList.add("is-disabled");
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("tabindex", "-1");
  };

  const openProjectModal = (projectId, trigger) => {
    const project = projectDetails[projectId];
    if (!project || !projectModal) return;

    projectModalLastFocus = trigger;
    projectModalTitle.textContent = project.title;
    projectModalDescription.textContent = project.shortDescription;
    projectModalType.textContent = project.type;
    projectModalCount.textContent = project.count;
    projectModalImage.src = project.image;
    projectModalImage.alt = project.imageAlt;
    projectModalOverview.textContent = project.overview;
    renderStack(projectModalStack, project.stack);
    renderList(projectModalFeatures, project.features);
    renderList(projectModalProcess, project.process);
    setModalAction(projectModalSite, project.site);
    setModalAction(projectModalGithub, project.github);

    document.body.classList.add("modal-open");
    projectModal.classList.add("active");
    projectModal.setAttribute("aria-hidden", "false");
    projectModal.querySelector(".project-modal-back")?.focus();
  };

  const closeProjectModal = () => {
    if (!projectModal) return;

    projectModal.classList.remove("active");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    projectModalLastFocus?.focus();
  };

  const projectRows = document.querySelectorAll(".project-row[data-project-id]");
  projectRows.forEach((row) => {
    const project = projectDetails[row.dataset.projectId];

    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-haspopup", "dialog");
    row.setAttribute("aria-label", `Open details for ${project?.title || "project"}`);
    row.querySelector(".project-link")?.setAttribute("tabindex", "-1");

    row.addEventListener("click", (event) => {
      event.preventDefault();
      openProjectModal(row.dataset.projectId, row);
    });

    row.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProjectModal(row.dataset.projectId, row);
    });
  });

  projectModal?.querySelectorAll("[data-modal-close]").forEach((control) => {
    control.addEventListener("click", closeProjectModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectModal?.classList.contains("active")) {
      closeProjectModal();
    }
  });

  if (projectModalPanel && canUseHoverEffects) {
    projectModalPanel.addEventListener("mousemove", (event) => {
      const rect = projectModalPanel.getBoundingClientRect();
      projectModalPanel.style.setProperty(
        "--modal-cursor-x",
        `${event.clientX - rect.left}px`
      );
      projectModalPanel.style.setProperty(
        "--modal-cursor-y",
        `${event.clientY - rect.top}px`
      );
      projectModalPanel.classList.add("cursor-active");
    });

    projectModalPanel.addEventListener("mouseleave", () => {
      projectModalPanel.classList.remove("cursor-active");
    });
  }

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
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#" || !targetId.startsWith("#")) return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        gsap.to(window, {
          duration: 0.28,
          scrollTo: { y: target, offsetY: 70 },
          ease: "power2.out",
          overwrite: "auto",
        });
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
