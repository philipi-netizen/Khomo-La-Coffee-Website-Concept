// =========================================================
// KHOMO LA COFFEE
// Premium interaction layer
// =========================================================

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const header = document.querySelector("[data-header]");
    const preloader = document.querySelector("#preloader");
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");
    const mobileLinks = document.querySelectorAll("[data-mobile-link]");
    const navLinks = document.querySelectorAll("[data-nav-link]");
    const revealElements = document.querySelectorAll("[data-reveal]");
    const parallaxElement = document.querySelector("[data-parallax]");
    const sections = document.querySelectorAll("[data-section]");
    const yearElement = document.querySelector("[data-year]");

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    let lastScrollY = window.scrollY;
    let ticking = false;
    let menuOpen = false;

    // =======================================================
    // YEAR
    // =======================================================

    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }


    // =======================================================
    // PRELOADER
    // =======================================================

    const hidePreloader = () => {
      if (!preloader) return;

      preloader.classList.add("is-hidden");

      // Remove it from the accessibility tree after transition.
      window.setTimeout(() => {
        preloader.setAttribute("aria-hidden", "true");
      }, 750);
    };

    if (document.readyState === "complete") {
      window.setTimeout(hidePreloader, 350);
    } else {
      window.addEventListener("load", () => {
        window.setTimeout(hidePreloader, 350);
      }, { once: true });
    }


    // =======================================================
    // NAVBAR
    // =======================================================

    const updateNavbar = () => {
      if (!header) return;

      const currentScrollY = window.scrollY;

      // Compact state after leaving the top.
      header.classList.toggle("is-compact", currentScrollY > 40);

      // Don't hide the navbar while the mobile menu is open.
      if (!menuOpen) {
        const scrollingDown = currentScrollY > lastScrollY;
        const hasScrolledEnough = currentScrollY > 120;

        if (scrollingDown && hasScrolledEnough) {
          header.classList.add("is-hidden");
        } else if (currentScrollY < lastScrollY) {
          header.classList.remove("is-hidden");
        }

        // Always show at the very top.
        if (currentScrollY <= 20) {
          header.classList.remove("is-hidden");
        }
      }

      lastScrollY = Math.max(currentScrollY, 0);
      ticking = false;
    };

    const requestNavbarUpdate = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbar);
        ticking = true;
      }
    };

    window.addEventListener("scroll", requestNavbarUpdate, {
      passive: true
    });


    // =======================================================
    // SMOOTH ANCHOR SCROLLING
    // =======================================================

    const getHeaderOffset = () => {
      if (!header) return 0;

      const navbar = header.querySelector(".navbar");

      return navbar ? navbar.offsetHeight + 24 : 24;
    };

    const scrollToTarget = (target) => {
      if (!target) return;

      const targetTop =
        target.getBoundingClientRect().top +
        window.scrollY -
        getHeaderOffset();

      if (prefersReducedMotion.matches) {
        window.scrollTo(0, targetTop);
      } else {
        window.scrollTo({
          top: targetTop,
          behavior: "smooth"
        });
      }
    };

    const anchorLinks = document.querySelectorAll(
      'a[href^="#"]:not([href="#"])'
    );

    anchorLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");

        if (!href || href === "#") return;

        const target = document.querySelector(href);

        if (!target) return;

        event.preventDefault();

        if (menuOpen) {
          closeMobileMenu();
        }

        scrollToTarget(target);

        // Update URL without forcing a second jump.
        if (window.history && window.history.pushState) {
          window.history.pushState(null, "", href);
        }
      });
    });


    // =======================================================
    // MOBILE MENU
    // =======================================================

    const openMobileMenu = () => {
      if (!menuToggle || !mobileMenu) return;

      menuOpen = true;

      menuToggle.classList.add("is-open");
      mobileMenu.classList.add("is-open");

      menuToggle.setAttribute("aria-expanded", "true");
      menuToggle.setAttribute("aria-label", "Close navigation menu");
      mobileMenu.setAttribute("aria-hidden", "false");

      body.classList.add("menu-open");

      // Keep navbar visible above the menu.
      if (header) {
        header.classList.remove("is-hidden");
        header.classList.add("is-compact");
      }

      // Focus first navigation link for keyboard users.
      const firstLink = mobileMenu.querySelector("a");

      if (firstLink) {
        window.setTimeout(() => firstLink.focus(), 100);
      }
    };

    function closeMobileMenu() {
      if (!menuToggle || !mobileMenu) return;

      menuOpen = false;

      menuToggle.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation menu");
      mobileMenu.setAttribute("aria-hidden", "true");

      body.classList.remove("menu-open");

      // Return focus to menu control.
      menuToggle.focus();
    }

    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener("click", () => {
        if (menuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });

      mobileLinks.forEach((link) => {
        link.addEventListener("click", () => {
          closeMobileMenu();
        });
      });

      // Close when clicking the menu backdrop.
      mobileMenu.addEventListener("click", (event) => {
        if (event.target === mobileMenu) {
          closeMobileMenu();
        }
      });

      // Close if the user clicks outside the navigation/menu.
      document.addEventListener("click", (event) => {
        if (!menuOpen) return;

        const clickedInsideMenu =
          mobileMenu.contains(event.target);

        const clickedToggle =
          menuToggle.contains(event.target);

        if (!clickedInsideMenu && !clickedToggle) {
          closeMobileMenu();
        }
      });
    }


    // =======================================================
    // ESCAPE KEY
    // =======================================================

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuOpen) {
        closeMobileMenu();
      }
    });


    // =======================================================
    // MOBILE MENU KEYBOARD LOOP
    // =======================================================

    if (mobileMenu) {
      mobileMenu.addEventListener("keydown", (event) => {
        if (event.key !== "Tab" || !menuOpen) return;

        const focusable = mobileMenu.querySelectorAll(
          'a[href], button:not([disabled])'
        );

        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    }


    // =======================================================
    // ACTIVE NAVIGATION
    // =======================================================

    if ("IntersectionObserver" in window && sections.length) {
      const sectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const sectionId = entry.target.dataset.section;

            navLinks.forEach((link) => {
              const href = link.getAttribute("href");

              link.classList.toggle(
                "is-active",
                href === `#${sectionId}`
              );
            });
          });
        },
        {
          root: null,
          rootMargin: "-30% 0px -55% 0px",
          threshold: 0
        }
      );

      sections.forEach((section) => {
        sectionObserver.observe(section);
      });
    }


    // =======================================================
    // SECTION REVEALS
    // =======================================================

    if (
      prefersReducedMotion.matches ||
      !("IntersectionObserver" in window)
    ) {
      revealElements.forEach((element) => {
        element.classList.add("is-revealed");
      });
    } else {
      const revealObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add("is-revealed");

            // One-time animation.
            observer.unobserve(entry.target);
          });
        },
        {
          root: null,
          rootMargin: "0px 0px -8% 0px",
          threshold: 0.08
        }
      );

      revealElements.forEach((element) => {
        revealObserver.observe(element);
      });
    }


    // =======================================================
    // HERO PARALLAX
    // =======================================================

    const canUseParallax = () => {
      return (
        parallaxElement &&
        window.innerWidth > 900 &&
        !prefersReducedMotion.matches
      );
    };

    let parallaxTicking = false;

    const updateParallax = () => {
      if (!canUseParallax()) {
        if (parallaxElement) {
          parallaxElement.style.transform = "";
        }

        parallaxTicking = false;
        return;
      }

      const hero = parallaxElement.closest(".hero");

      if (!hero) {
        parallaxTicking = false;
        return;
      }

      const rect = hero.getBoundingClientRect();

      // Stop unnecessary calculations once the hero is well
      // outside the viewport.
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        parallaxTicking = false;
        return;
      }

      const progress =
        Math.max(
          -1,
          Math.min(
            1,
            -rect.top / Math.max(rect.height, 1)
          )
        );

      const movement = progress * 18;

      parallaxElement.style.transform =
        `translate3d(0, ${movement}px, 0)`;

      parallaxTicking = false;
    };

    const requestParallaxUpdate = () => {
      if (!parallaxTicking) {
        window.requestAnimationFrame(updateParallax);
        parallaxTicking = true;
      }
    };

    if (parallaxElement) {
      window.addEventListener("scroll", requestParallaxUpdate, {
        passive: true
      });

      window.addEventListener("resize", requestParallaxUpdate, {
        passive: true
      });

      prefersReducedMotion.addEventListener(
        "change",
        requestParallaxUpdate
      );

      requestParallaxUpdate();
    }


    // =======================================================
    // WHATSAPP CONTEXTUAL LINKS
    // =======================================================

    const whatsappNumber = "265888914141";

    const whatsappMessages = {
      general:
        "Hi, I'd like to enquire about Khomo La Coffee.",

      visit:
        "Hi, I'd like to enquire about visiting Khomo La Coffee.",

      menu:
        "Hi, I'd like to enquire about the menu.",

      group:
        "Hi, I'd like to enquire about a visit for a group."
    };

    const createWhatsAppUrl = (message) => {
      return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    const whatsappLinks = document.querySelectorAll(
      'a[href*="wa.me"]'
    );

    whatsappLinks.forEach((link) => {
      const text = link.textContent.toLowerCase();

      let message = whatsappMessages.general;

      if (
        text.includes("plan your visit") ||
        text.includes("visit")
      ) {
        message = whatsappMessages.visit;
      }

      link.setAttribute(
        "href",
        createWhatsAppUrl(message)
      );
    });


    // =======================================================
    // RESIZE SAFETY
    // =======================================================

    let resizeTimer;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(resizeTimer);

        resizeTimer = window.setTimeout(() => {
          if (window.innerWidth > 760 && menuOpen) {
            closeMobileMenu();
          }

          requestParallaxUpdate();
        }, 150);
      },
      { passive: true }
    );


    // =======================================================
    // INITIAL STATE
    // =======================================================

    updateNavbar();

    // If reduced motion is enabled, don't leave anything
    // waiting for animation.
    if (prefersReducedMotion.matches) {
      if (preloader) {
        preloader.classList.add("is-hidden");
      }
    }
  });
})();