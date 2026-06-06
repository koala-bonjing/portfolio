// script.js - Sonny Dela Cruz Portfolio
// Complete interactive functionality with GSAP animations

document.addEventListener("DOMContentLoaded", () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  const finePointerQuery = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  );
  const reducedMotionQuery = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  const smallScreenQuery = window.matchMedia("(max-width: 700px)");
  const canUseHoverEffects =
    finePointerQuery.matches && !reducedMotionQuery.matches;
  const useLiteMotion =
    reducedMotionQuery.matches ||
    smallScreenQuery.matches ||
    !finePointerQuery.matches;

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
      canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0,
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
    if (!supportsWebp || !webpSrc || missingOptimizedImages.has(webpSrc))
      return;

    preloadImage(
      webpSrc,
      () => {
        img.src = webpSrc;
      },
      () => {
        missingOptimizedImages.add(webpSrc);
      },
    );
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
      { rootMargin: "360px" },
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
  let mouseX = 0,
    mouseY = 0;
  let cursorX = 0,
    cursorY = 0;
  let followerX = 0,
    followerY = 0;

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
      .map(
        (word) =>
          `<span class="word-mask"><span class="word-inner">${word}</span></span>`,
      )
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
      { height: "100%", duration: 1.4, ease: "power4.inOut", stagger: 0.15 },
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
    "-=0.8",
  );
  introTl.to(
    ".hero .display .word-inner",
    {
      y: "0%",
      duration: useLiteMotion ? 0.55 : 1.2,
      ease: useLiteMotion ? "power3.out" : "power4.out",
      stagger: useLiteMotion ? 0.012 : 0.04,
    },
    "-=0.8",
  );
  introTl.to(
    ".hero .subtitle .word-inner",
    {
      y: "0%",
      duration: useLiteMotion ? 0.4 : 0.8,
      ease: "power3.out",
      stagger: useLiteMotion ? 0.01 : 0.03,
    },
    "-=0.9",
  );
  introTl.fromTo(
    ".hero-actions",
    { opacity: 0, y: 20 },
    {
      opacity: 1,
      y: 0,
      duration: useLiteMotion ? 0.4 : 0.8,
      ease: "power3.out",
    },
    "-=0.6",
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
      },
    );
  }

  // ============================================
  // 8. SCROLL REVEAL ANIMATIONS
  // ============================================
  const reveals = document.querySelectorAll(
    ".reveal:not(.hero *):not(#credentials .reveal)",
  );
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
          toggleActions: useLiteMotion
            ? "play none none none"
            : "play none none reverse",
        },
      },
    );
  });

  // ============================================
  // 9. CREDENTIALS SECTION SCROLL SEQUENCE
  // ============================================
  const credentialsSection = document.querySelector("#credentials");
  if (credentialsSection && !useLiteMotion) {
    const credentialsInfo =
      credentialsSection.querySelector(".credentials-info");
    const educationTitle = credentialsSection.querySelector(
      ".education-group .credential-group-title",
    );
    const educationTimeline = credentialsSection.querySelector(
      ".education-timeline",
    );
    const educationSteps =
      credentialsSection.querySelectorAll(".education-step");
    const educationMarkers =
      credentialsSection.querySelectorAll(".education-marker");
    const certificationTitle = credentialsSection.querySelector(
      ".certification-group .credential-group-title",
    );
    const certificationSlider = credentialsSection.querySelector(
      ".certification-slider",
    );
    const certificationCards = credentialsSection.querySelectorAll(
      ".certification-card",
    );

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
        { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out" },
      );
    }

    if (educationTitle) {
      credentialsTl.fromTo(
        educationTitle,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.25",
      );
    }

    if (educationTimeline) {
      credentialsTl
        .fromTo(
          educationTimeline,
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" },
          "-=0.15",
        )
        .to(
          educationTimeline,
          { "--timeline-progress": 1, duration: 0.75, ease: "power2.out" },
          "-=0.3",
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
        "-=0.55",
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
        "-=0.55",
      );
    }

    if (certificationTitle) {
      credentialsTl.fromTo(
        certificationTitle,
        { autoAlpha: 0, y: 26 },
        { autoAlpha: 1, y: 0, duration: 0.45, ease: "power3.out" },
        "-=0.1",
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
        "-=0.2",
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
        "-=0.55",
      );
    }
  }

  // ============================================
  // 10. PROJECT FLOATING PREVIEW (Image Follower)
  // ============================================
  const preview = document.querySelector(".project-floating-preview");
  const previewImg = preview ? preview.querySelector(".preview-img") : null;
  const previewItems = document.querySelectorAll(".project-row[data-image]");

  let targetX = 0,
    targetY = 0;
  let previewX = 0,
    previewY = 0;

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
            preloadImage(
              webpUrl,
              () => {
                previewImg.src = webpUrl;
              },
              () => {
                missingOptimizedImages.add(webpUrl);
              },
            );
          }
        }
        previewX = targetX;
        previewY = targetY;
        setPreviewPosition();
        preview.classList.add("active");
      });
      item.addEventListener("mouseleave", () => {
        preview.classList.remove("active");
      });
    });
  }

  // ============================================
  // 11. PROJECT DETAIL MODAL
  // ============================================
  const projectDetails = {
    "ccdi-career": {
      count: "01 / 06",
      title: "CCDI Automated Career Assessment Test",
      type: "Full Stack",
      shortDescription:
        "AI-assisted student assessment platform that recommends career tracks and supports enrollment decisions for CCDI.",
      stack: [
        "MongoDB",
        "React",
        "Node.js",
        "Express",
        "Google Gemini API",
        "JWT Auth",
        "Brevo",
        "Vercel",
      ],
      image: "ccdi-career.webp",
      imageAlt: "CCDI Automated Career Assessment Test interface",
      site: "https://ccdi-career-assestment.vercel.app",
      github: "https://github.com/koala-bonjing/ccdi-career-assestment",
      proof: [
        {
          label: "Role",
          value: "Lead full-stack developer",
        },
        {
          label: "Impact",
          value: "Replaced paper-based admission testing across 8 programs",
        },
        {
          label: "Validation",
          value: "100+ first-cycle enrollees and ISO 25010 evaluation",
        },
      ],
      overview:
        "This project turns CCDI's paper-based admission assessment into a guided digital workflow. Students answer structured questions, Gemini evaluates their responses, and the interface presents personalized course recommendations across 8 programs.",
      features: [
        "Student-friendly assessment flow with clear step-by-step progression.",
        "Gemini-powered evaluation that analyzes student responses and generates personalized course recommendations.",
        "JWT-based authentication and session handling for student access.",
        "Brevo-supported communication flow for enrollment-related messaging.",
        "Vercel deployment used for institutional admission operations.",
        "Validated as highly acceptable by 43 students and 3 IT experts through formal ISO 25010 evaluation.",
      ],
      process: [
        "Mapped the assessment journey around how future enrollees answer questions and how staff interpret results.",
        "Designed the interface to keep long forms approachable through hierarchy, spacing, and progressive feedback.",
        "Built the MERN workflow around reusable UI patterns, API boundaries, and secure student sessions.",
      ],
    },

    labxchange: {
      count: "02 / 06",
      title: "LabXChange",
      type: "Frontend",
      shortDescription:
        "Production healthcare LIS interface focused on secure role-aware workflows, patient data handling, and reliable frontend delivery.",
      stack: [
        "React 18 (Vite)",
        "TypeScript",
        "Tailwind CSS v4",
        "TanStack Query",
        "Zustand",
        "Zod",
        "Vitest",
      ],
      image: "labX.webp",
      imageAlt: "LabXChange dashboard interface",
      site: "",
      github: "",
      proof: [
        {
          label: "Role",
          value: "Frontend developer contribution in a production healthcare LIS",
        },
        {
          label: "Scope",
          value: "RBAC hierarchy, CRUD audit logs, table refresh, and print docs",
        },
        {
          label: "Quality",
          value: "Vitest coverage for third-party integration flows",
        },
      ],
      overview:
        "LabXChange360 is a healthcare laboratory information system interface designed to support data-heavy patient, test order, reporting, and integration workflows. As a frontend developer, I contributed production features around access control, auditability, reusable data refresh behavior, print documents, and tested external service integrations.",
      features: [
        "Implemented RBAC role hierarchy management as a module feature.",
        "Built a CRUD-based audit log table for tracking user activity.",
        "Created a reusable table refresh component that standardized async state handling across data-dependent modules.",
        "Engineered dynamic biometric print documents configurable per organization.",
        "Covered third-party integration forms, revised API validation, and MRE Draft Status filtering with Vitest unit tests.",
      ],
      process: [
        "Translated dense healthcare workflows into readable React and TypeScript interfaces.",
        "Used TanStack Query, Zustand, and Zod to keep data fetching, state, and validation predictable.",
        "Documented daily frontend progress, blockers, and UI/UX handoffs in Confluence to support team visibility.",
      ],
    },
    "ccdi-admin": {
      count: "03 / 06",
      title: "CCDI Automated Career Assessment Test - Admin Dashboard",
      type: "Full Stack",
      shortDescription:
        "Administrative dashboard for managing assessments, reviewing student results, and organizing career guidance data.",
      stack: ["MongoDB", "React", "Node.js", "Express", "Mantine UI"],
      image: "admin.webp",
      imageAlt: "CCDI admin dashboard interface",
      site: "https://ccdi-admin-capstone.vercel.app/",
      github: "https://github.com/koala-bonjing/ccdi-admin-capstone",
      proof: [
        {
          label: "Role",
          value: "Full-stack dashboard developer",
        },
        {
          label: "Users",
          value: "Built around staff review and assessment management tasks",
        },
        {
          label: "Proof",
          value: "Live admin deployment with public GitHub repository",
        },
      ],
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
    "sorsogon-tour": {
      count: "04 / 06",
      title: "Sorsogon Virtual Tour Mobile Application",
      type: "Mobile",
      shortDescription:
        "Native Android tourism app with secure captcha login, clickable municipality maps, and realtime Firebase-backed destination data.",
      stack: ["Java", "Android Studio", "Firebase", "NoSQL", "Captcha"],
      image: "sorsogon-tour.webp",
      imageAlt: "Sorsogon Virtual Tour Android application interface",
      site: "",
      github: "",
      proof: [
        {
          label: "Context",
          value: "WorldSkills ITSSB test project",
        },
        {
          label: "Core",
          value: "Custom captcha login, interactive map, and live destination tracking",
        },
        {
          label: "Data",
          value: "Realtime Firebase sync for tourism content",
        },
      ],
      overview:
        "The Sorsogon Virtual Tour app is a fully functional native Android tourism project built to meet WorldSkills ITSSB specifications. It combines a custom 6-character alphanumeric captcha login, an interactive municipality map, live destination tracking, and realtime Firebase data sync.",
      features: [
        "Custom-generated 6-character alphanumeric captcha validation for the login flow.",
        "Interactive clickable map that highlights selected municipalities.",
        "Live destination tracking and localized tourism records.",
        "Firebase-backed NoSQL structure for profiles, locations, entrance fees, and amenities.",
        "Native Android screens built in Java with Android Studio.",
      ],
      process: [
        "Followed strict WorldSkills-style structural and design specifications.",
        "Modeled tourism data around municipalities, destination details, user records, and filtered amenities.",
        "Focused the mobile flow on secure access, fast destination scanning, and clear local information.",
      ],
    },
    syncstudy: {
      count: "05 / 06",
      title: "SyncStudy - Peer Study Group Finder",
      type: "Full Stack",
      shortDescription:
        "Peer study group finder that helps students discover, organize, and join study sessions with matching interests.",
      stack: ["React", "Node.js", "Express", "PostgreSQL"],
      image: "tutor-sync.webp",
      imageAlt: "SyncStudy peer study group finder interface",
      site: "",
      github: "",
      proof: [
        {
          label: "Status",
          value: "Student collaboration prototype",
        },
        {
          label: "Focus",
          value: "Discovery, comparison, and low-friction group joining",
        },
        {
          label: "Backend",
          value: "Planned around users, groups, participation, and scheduling",
        },
      ],
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
    "truck-operations": {
      count: "06 / 06",
      title: "KRISDOM IN GO - Truck Operations Management System",
      type: "Full Stack",
      shortDescription:
        "Operations platform for managing dispatch bookings, live fleet status, trip logs, billing records, POD files, and fleet/personnel registration.",
      stack: [
        "Next.js",
        "React",
        "TypeScript",
        "Mantine UI",
        "Drizzle ORM",
        "Supabase",
        "React Context",
      ],
      image: "trucking.webp",
      imageAlt: "Truck operations management dashboard interface",
      site: "",
      github: "",
      proof: [
        {
          label: "Role",
          value: "Full-stack developer on active production system",
        },
        {
          label: "Modules",
          value: "Booking, dispatch, fleet status, trip logs, billing, PODs",
        },
        {
          label: "Impact",
          value: "Replaced spreadsheet-based fleet monitoring",
        },
      ],
      overview:
        "The Truck Operations Management System gives dispatchers and admins a centralized workspace for daily fleet operations. It replaced manual spreadsheet-based monitoring with an active production system covering bookings, dispatch, live fleet status, trip logs, billing, POD files, and registration records.",
      features: [
        "Dashboard with income summaries, operation tables, and live fleet status filtering.",
        "Dispatch booking workflow for clients, routes, trucks, drivers, helpers, pickup details, and drop-off information.",
        "Booking list and trip logs for reviewing, updating, and completing trip records.",
        "Billing module with date/client filters, trip summaries, CSV export, POD preview, and POD download handling.",
        "Dynamic drop-off fields, client-side pagination, and PDF, XLSX, and DOCX export hooks.",
        "Registration tools for managing clients, trucks, drivers, and helpers.",
      ],
      process: [
        "Separated daily operations into dashboard, dispatch, booking, trip log, billing, and registration modules.",
        "Built reusable Mantine-based tables, forms, modals, badges, and action controls for consistent workflows.",
        "Used shared React Context across modules to keep reporting and operations data consistent.",
        "Took the system from zero to active production for day-to-day logistics operations.",
      ],
    },
  };

  const projectModal = document.getElementById("projectModal");
  const projectModalTitle = document.getElementById("projectModalTitle");
  const projectModalDescription = document.getElementById(
    "projectModalDescription",
  );
  const projectModalType = document.getElementById("projectModalType");
  const projectModalCount = document.getElementById("projectModalCount");
  const projectModalStack = document.getElementById("projectModalStack");
  const projectModalImage = document.getElementById("projectModalImage");
  const projectModalImageButton = document.getElementById(
    "projectModalImageButton",
  );
  const projectModalProof = document.getElementById("projectModalProof");
  const projectModalOverview = document.getElementById("projectModalOverview");
  const projectModalFeatures = document.getElementById("projectModalFeatures");
  const projectModalProcess = document.getElementById("projectModalProcess");
  const projectModalSite = document.getElementById("projectModalSite");
  const projectModalGithub = document.getElementById("projectModalGithub");
  const projectModalPanel = projectModal?.querySelector(".project-modal-panel");
  const imageLightbox = document.getElementById("imageLightbox");
  const imageLightboxImage = document.getElementById("imageLightboxImage");
  const imageLightboxClose = imageLightbox?.querySelector(
    ".image-lightbox-close",
  );
  let projectModalLastFocus = null;
  let imageLightboxLastFocus = null;

  const renderList = (target, items) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  };

  const renderStack = (target, items) => {
    if (!target) return;
    target.innerHTML = items.map((item) => `<span>${item}</span>`).join("");
  };

  const renderProof = (target, items = []) => {
    if (!target) return;

    target.hidden = items.length === 0;
    target.innerHTML = items
      .map(
        (item) => `
          <article class="project-proof-card">
            <span>${item.label}</span>
            <strong>${item.value}</strong>
          </article>
        `,
      )
      .join("");
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

  const closeImageLightbox = ({ restoreFocus = true } = {}) => {
    if (!imageLightbox) return;

    imageLightbox.classList.remove("active");
    imageLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("image-lightbox-open");

    if (!projectModal?.classList.contains("active")) {
      document.body.classList.remove("modal-open");
    }

    if (restoreFocus) {
      imageLightboxLastFocus?.focus();
    }
  };

  const openImageLightbox = (trigger) => {
    if (!imageLightbox || !imageLightboxImage || !projectModalImage?.src) return;

    imageLightboxLastFocus = trigger;
    imageLightboxImage.src = projectModalImage.src;
    imageLightboxImage.alt = projectModalImage.alt;
    document.body.classList.add("modal-open", "image-lightbox-open");
    imageLightbox.classList.add("active");
    imageLightbox.setAttribute("aria-hidden", "false");
    imageLightboxClose?.focus();
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
    projectModalImageButton?.setAttribute(
      "aria-label",
      `Open larger preview of ${project.title}`,
    );
    projectModalOverview.textContent = project.overview;
    renderStack(projectModalStack, project.stack);
    renderProof(projectModalProof, project.proof);
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

    closeImageLightbox({ restoreFocus: false });
    projectModal.classList.remove("active");
    projectModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    projectModalLastFocus?.focus();
  };

  const projectRows = document.querySelectorAll(
    ".project-row[data-project-id]",
  );
  projectRows.forEach((row) => {
    const project = projectDetails[row.dataset.projectId];

    row.setAttribute("role", "button");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-haspopup", "dialog");
    row.setAttribute(
      "aria-label",
      `Open details for ${project?.title || "project"}`,
    );
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

  projectModalImageButton?.addEventListener("click", () => {
    openImageLightbox(projectModalImageButton);
  });

  imageLightbox?.querySelectorAll("[data-image-lightbox-close]").forEach(
    (control) => {
      control.addEventListener("click", () => closeImageLightbox());
    },
  );

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (imageLightbox?.classList.contains("active")) {
      closeImageLightbox();
      return;
    }

    if (projectModal?.classList.contains("active")) {
      closeProjectModal();
    }
  });

  if (projectModalPanel && canUseHoverEffects) {
    projectModalPanel.addEventListener("mousemove", (event) => {
      const rect = projectModalPanel.getBoundingClientRect();
      projectModalPanel.style.setProperty(
        "--modal-cursor-x",
        `${event.clientX - rect.left}px`,
      );
      projectModalPanel.style.setProperty(
        "--modal-cursor-y",
        `${event.clientY - rect.top}px`,
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
              clearProps: "all",
            },
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
  // 14. CERTIFICATION SLIDER
  // ============================================
  const certSlider = document.querySelector(".certification-slider");
  const certTrack = document.querySelector(".certification-track");

  if (certTrack) {
    const syncCertificationLoop = () => {
      const firstLoop = certTrack.querySelector(
        ".certification-loop:not([aria-hidden])",
      );
      if (!firstLoop) return;

      const trackStyle = window.getComputedStyle(certTrack);
      const trackGap =
        Number.parseFloat(trackStyle.columnGap || trackStyle.gap) || 0;
      const loopWidth = firstLoop.getBoundingClientRect().width;
      if (!loopWidth) return;

      certTrack.style.setProperty(
        "--cert-loop-distance",
        `${-(loopWidth + trackGap)}px`,
      );
    };

    syncCertificationLoop();
    window.addEventListener("resize", syncCertificationLoop);
    window.addEventListener("load", syncCertificationLoop);
  }

  if (certSlider && certTrack) {
    const mobileCertCards = certSlider.querySelectorAll(
      ".certification-loop:not([aria-hidden]) .certification-card",
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
          dot.setAttribute(
            "aria-current",
            index === activeIndex ? "true" : "false",
          );
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
          Math.min(
            mobileCertCards.length - 1,
            Math.round(certTrack.scrollLeft / step),
          ),
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
