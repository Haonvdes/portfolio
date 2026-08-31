document.addEventListener("DOMContentLoaded", function () {
    function loadComponent(id, file, callback) {
        fetch(file)
            .then(response => response.text())
            .then(data => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = data;
                    if (callback) callback(); // Run callback AFTER loading the component
                } else {
                    console.error(`Element with ID ${id} not found.`);
                }
            })
            .catch(error => console.error("Error loading component:", error));
    }

    // Determine base path based on current page location
    const basePath = window.location.pathname.includes('/case-studies/') ? '../' : './';

    // Load navigation and footer dynamically
    loadComponent("nav-placeholder", basePath + "templates/nav.html", function () {
        // Now the nav has been loaded, we can safely attach the event listener
        setTimeout(() => {  // Ensure it runs after the DOM updates
            const menuToggle = document.getElementById("menu-toggle");
            const menu = document.getElementById("menu-links");

            if (menuToggle && menu) {
                menuToggle.addEventListener("click", function () {
                    const isOpen = menu.classList.toggle("active");
                    menuToggle.classList.toggle("active", isOpen);
                    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
                    document.body.classList.toggle("nav-open", isOpen);
                });

                // Full-page menu covers the whole viewport, so a tapped link
                // needs the menu (and the scroll lock) cleared immediately —
                // otherwise the next page can load underneath a still-open,
                // scroll-locked overlay for a moment.
                menu.querySelectorAll("a").forEach(function (link) {
                    link.addEventListener("click", function () {
                        menu.classList.remove("active");
                        menuToggle.classList.remove("active");
                        menuToggle.setAttribute("aria-expanded", "false");
                        document.body.classList.remove("nav-open");
                    });
                });
                console.log("Menu toggle event listener added successfully.");
            } else {
                console.error("Menu toggle elements not found.");
            }

            // Reveal the nav when the reader scrolls up past the hero, hide
            // it again on the way back down.
            //
            // `.rd-nav-outer` starts as its normal static, in-flow self —
            // untouched — and only gets `position: fixed` (redesign.css)
            // once scrollY passes the bar's own height. A spacer of that same
            // height is inserted in its place at that exact moment so the
            // page never reflows. (`position: sticky` can't do this: `html`'s
            // `overflow-x: hidden` in style.css silently resolves
            // `overflow-y` to `auto`, which breaks sticky's containing-block
            // lookup — confirmed live, the box tracked scrollY 1:1 instead of
            // sticking.)
            const navOuter = document.querySelector(".rd-nav-outer");
            if (navOuter) {
                const navSpacer = document.createElement("div");
                navSpacer.setAttribute("aria-hidden", "true");
                navSpacer.style.display = "none";
                navOuter.insertAdjacentElement("afterend", navSpacer);

                const THRESHOLD = 20;
                let navHeight = navOuter.offsetHeight;
                let isFixed = false;
                let stableY = window.scrollY;

                // Crossing into/out of fixed mode is a plain position check
                // against a height measured once up front (not re-read on
                // every tick — `offsetHeight` forces layout, and doing that
                // on every scroll event would thrash it). Runs synchronously,
                // not on a rAF, and not throttled: `scrollend` (below) can
                // fire only a few ms after the final `scroll` event of a
                // gesture — measured live, ~5ms — which is faster than a
                // deferred rAF callback, so a throttled version of this ran
                // AFTER scrollend and left `isFixed` stale for that whole
                // reveal decision.
                window.addEventListener("scroll", () => {
                    const y = window.scrollY;
                    if (!isFixed && y > navHeight) {
                        navSpacer.style.height = navHeight + "px";
                        navSpacer.style.display = "block";
                        navOuter.classList.add("rd-nav-fixed", "rd-nav-hidden");
                        isFixed = true;
                    } else if (isFixed && y <= navHeight) {
                        clearHideTimer();
                        navOuter.classList.remove("rd-nav-fixed", "rd-nav-hidden", "rd-nav-peek");
                        navSpacer.style.display = "none";
                        isFixed = false;
                        stableY = y;
                    }
                }, { passive: true });

                // Direction (peek vs. hidden), by contrast, is only decided
                // once scrolling has actually settled — never mid-scroll.
                // Chrome's own wheel-scroll easing overshoots the target and
                // corrects back (a single big wheel notch wobbled a genuine
                // ~350px "upward" over its ~150ms settle), and on the pages
                // with mandatory CSS scroll-snap (home, about) the snap's own
                // `scroll-behavior: smooth` tail runs far longer — up to
                // ~800ms measured. Sampling at any fixed cadence mid-motion
                // eventually lands inside one of those tails and reads it as
                // a genuine reversal. `scrollend` sidesteps the whole problem
                // by only ever comparing two already-settled positions.
                // Auto-hide the peeked nav after 5s of no pointer interest,
                // so it doesn't linger over content the reader scrolled up
                // to see. Hovering cancels the timer; leaving restarts it
                // (only while still peeked — a nav already hidden or pinned
                // at the top has nothing to auto-hide).
                const AUTO_HIDE_DELAY = 5000;
                let hideTimer = null;
                const clearHideTimer = () => {
                    if (hideTimer) {
                        clearTimeout(hideTimer);
                        hideTimer = null;
                    }
                };
                const scheduleHideTimer = () => {
                    clearHideTimer();
                    hideTimer = setTimeout(() => {
                        navOuter.classList.remove("rd-nav-peek");
                        navOuter.classList.add("rd-nav-hidden");
                        hideTimer = null;
                    }, AUTO_HIDE_DELAY);
                };

                const classifyDirection = () => {
                    if (!isFixed) return;
                    const y = window.scrollY;
                    const delta = y - stableY;
                    if (delta > THRESHOLD) {
                        clearHideTimer();
                        navOuter.classList.remove("rd-nav-peek");
                        navOuter.classList.add("rd-nav-hidden");
                    } else if (delta < -THRESHOLD) {
                        navOuter.classList.add("rd-nav-peek");
                        navOuter.classList.remove("rd-nav-hidden");
                        scheduleHideTimer();
                    }
                    stableY = y;
                };

                navOuter.addEventListener("mouseenter", clearHideTimer);
                navOuter.addEventListener("mouseleave", () => {
                    if (navOuter.classList.contains("rd-nav-peek")) {
                        scheduleHideTimer();
                    }
                });

                if ("onscrollend" in window) {
                    window.addEventListener("scrollend", classifyDirection);
                } else {
                    // Safari < 17.4 fallback: settle-detection via debounce.
                    let settleTimer;
                    window.addEventListener("scroll", () => {
                        clearTimeout(settleTimer);
                        settleTimer = setTimeout(classifyDirection, 200);
                    }, { passive: true });
                }

                window.addEventListener("resize", () => {
                    navHeight = navOuter.offsetHeight;
                    if (isFixed) navSpacer.style.height = navHeight + "px";
                });
            }
        }, 100); // Small delay to ensure elements are available
    });

    loadComponent("footer-placeholder", basePath + "templates/footer.html");

    // Initialize tabs if they exist
    if (document.getElementById('defaultOpen')) {
        document.getElementById('defaultOpen').click();
    }

    // Initialize process content if selector exists
    if (document.getElementById('phaseSelector')) {
        updateProcess();
    }
    
    // The case-study cards only exist on work.html
    if (window.location.pathname.includes('work.html')) {
        initializeCaseStudyLinks();
    }
    
    // Initialize Swiper if the container exists
    if (document.querySelector('.swiper-container')) {
        const swiper = new Swiper('.swiper-container', {
            // The Strava fetch lands AFTER this runs and can grow the row, which
            // leaves Swiper's cached slide dimensions stale. These two make it
            // re-measure itself instead of needing a manual .update() call.
            observer: true,
            observeParents: true,
            loop: true,                // Enable infinite loop
            autoplay: {                // Auto-slide settings
                delay: 3000,           // 3 seconds per slide
                disableOnInteraction: false,
            },
            navigation: {              // Arrow navigation
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }
    
    // Initialize responsive stage items
    function updateClass() {
        const stageItems = document.querySelectorAll(".stage-item .sub-heading");
        const isSmallScreen = window.innerWidth <= 768;

        stageItems.forEach(item => {
            if (isSmallScreen) {
                item.classList.remove("sub-heading");
                item.classList.add("md-bold");
            } else {
                item.classList.remove("md-bold");
                item.classList.add("sub-heading");
            }
        });
    }

    updateClass();
    window.addEventListener("resize", updateClass);
});

// This is for tab content //

function openHastag(evt, tagName) {
    // Declare all variables
    var i, tagcontent, taglinks, lgElements;
  
    // Get all elements with class="tagcontent" and hide them
    tagcontent = document.getElementsByClassName("information");
    for (i = 0; i < tagcontent.length; i++) {
      tagcontent[i].style.display = "none";
    }
  
    // Get all elements with class="taglinks" and remove the class "active"
    taglinks = document.getElementsByClassName("hastag-items");
    for (i = 0; i < taglinks.length; i++) {
      taglinks[i].className = taglinks[i].className.replace(" active", "");
    }
  
    // Get all elements with class="lg-bold" and change them back to "lg-regular" if needed
    lgElements = document.getElementsByClassName("lg-bold");
    for (i = 0; i < lgElements.length; i++) {
      lgElements[i].className = lgElements[i].className.replace("lg-bold", "lg-regular");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tagName).style.display = "flex";
    evt.currentTarget.className += " active";
  
    // Change the class name from "lg-regular" to "lg-bold" for the active tab
    var activeLgElement = evt.currentTarget.getElementsByClassName("lg-regular")[0];
    if (activeLgElement) {
      activeLgElement.className = activeLgElement.className.replace("lg-regular", "lg-bold");
    }
  
    // Change lg-bold back to lg-regular if the tab is not active anymore
    var inactiveLgElements = document.querySelectorAll(".hastag-items:not(.active) .lg-bold");
    inactiveLgElements.forEach(function(element) {
      element.className = element.className.replace("lg-bold", "lg-regular");
    });
  }
  
  // Case-study card routing.
  //
  // The password gate was removed on 2026-08-12 — case studies are open to
  // everyone now. Removed with it: the #passwordModal flow, the JWT kept in
  // sessionStorage, and the POST to https://api.stpnguyen.com/api/verify.
  // The modal markup is still in work.html but is never shown; the per-page
  // guard in case-studies/web-3.html was already commented out.
  function initializeCaseStudyLinks() {
      document.querySelectorAll('[data-case-study]').forEach((card) => {
          // Cards flagged data-status="coming-soon" have no page under
          // /case-studies/ yet, so routing them would land on a 404. They are
          // styled as disabled in case-retheme-v3.css; skipping the listener
          // here is what makes that styling true. When a page ships, delete the
          // attribute from that card in work.html — nothing else needs editing.
          if (card.dataset.status === 'coming-soon') return;

          card.addEventListener('click', (e) => {
              const name = e.currentTarget.dataset.caseStudy;
              if (!name) {
                  console.error('Card is missing its data-case-study attribute');
                  return;
              }
              const slug = name.toLowerCase().replace(/\s+/g, '-');
              window.location.href = `case-studies/${slug}.html`;
          });
      });

      // Belt and braces: if the leftover modal markup is present, keep it shut.
      const modal = document.getElementById('passwordModal');
      if (modal) modal.style.display = 'none';
  }

  //case study //
  
  document.addEventListener("DOMContentLoaded", function () {
    function updateClass() {
        const stageItems = document.querySelectorAll(".stage-item .sub-heading");
        const isSmallScreen = window.innerWidth <= 768;
  
        stageItems.forEach(item => {
            if (isSmallScreen) {
                item.classList.remove("sub-heading");
                item.classList.add("md-bold");
            } else {
                item.classList.remove("md-bold");
                item.classList.add("sub-heading");
            }
        });
    }
  
    // Initial call to set the correct class
    updateClass();
  
    // Update classes on window resize
    window.addEventListener("resize", updateClass);
  });
  
  // Giữ lại function openHastag cho tabs
  function openHastag(evt, tagName) {
    // Declare all variables
    var i, tagcontent, taglinks, lgElements;
  
    // Get all elements with class="tagcontent" and hide them
    tagcontent = document.getElementsByClassName("information");
    for (i = 0; i < tagcontent.length; i++) {
      tagcontent[i].style.display = "none";
    }
  
    // Get all elements with class="taglinks" and remove the class "active"
    taglinks = document.getElementsByClassName("hastag-items");
    for (i = 0; i < taglinks.length; i++) {
      taglinks[i].className = taglinks[i].className.replace(" active", "");
    }
  
    // Get all elements with class="lg-bold" and change them back to "lg-regular" if needed
    lgElements = document.getElementsByClassName("lg-bold");
    for (i = 0; i < lgElements.length; i++) {
      lgElements[i].className = lgElements[i].className.replace("lg-bold", "lg-regular");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tagName).style.display = "flex";
    evt.currentTarget.className += " active";
  
    // Change the class name from "lg-regular" to "lg-bold" for the active tab
    var activeLgElement = evt.currentTarget.getElementsByClassName("lg-regular")[0];
    if (activeLgElement) {
      activeLgElement.className = activeLgElement.className.replace("lg-regular", "lg-bold");
    }
  
    // Change lg-bold back to lg-regular if the tab is not active anymore
    var inactiveLgElements = document.querySelectorAll(".hastag-items:not(.active) .lg-bold");
    inactiveLgElements.forEach(function(element) {
      element.className = element.className.replace("lg-bold", "lg-regular");
    });
  }
  
  
  
  
  
  
  
// tooltip// 
  
  document.addEventListener("DOMContentLoaded", function () {
    const tooltip = document.getElementById("tooltip");
    const tooltipContainers = document.querySelectorAll(".tooltip-container");

    tooltipContainers.forEach(container => {
        container.addEventListener("mouseenter", function () {
            const text = container.getAttribute("data-tooltip");
            tooltip.textContent = text;
            tooltip.style.visibility = "visible";
            tooltip.style.opacity = "1";
            tooltip.style.display = "flex"
            tooltip.style.alignItems = "center"
            tooltip.style.padding = "16px"


            // Positioning the tooltip dynamically
            const rect = container.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
            tooltip.style.left = `${rect.left + rect.width / 2}px`;
        });

        container.addEventListener("mouseleave", function () {
            tooltip.style.visibility = "hidden";
            tooltip.style.opacity = "0";
        });
    });
});
  
  
const processData = {};

// These templates are consumed from two directory depths — the site root and
// /case-studies/ — so both the fetch and the asset paths inside the markup have
// to be resolved against the page, not hardcoded. Same rule as loadComponent()
// above; declared separately because this block runs at script load, outside
// the DOMContentLoaded closure.
const processBasePath = window.location.pathname.includes('/case-studies/') ? '../' : './';

// Function to load an HTML file
async function loadTemplate(name) {
    const response = await fetch(`${processBasePath}templates/${name}.html`);
    const html = await response.text();
    // product.html and sprint.html embed "./public/*.svg". Rewriting here keeps
    // the templates themselves portable instead of pinning them to one depth.
    return html.split('"./public/').join(`"${processBasePath}public/`);
}

// Load all templates asynchronously
async function loadTemplates() {
    processData.phase = await loadTemplate('phase');
    processData.sprint = await loadTemplate('sprint');
    processData.product = await loadTemplate('product');
}
// Call the function to load templates on page load
loadTemplates();

async function updateProcess() {
    const selector = document.getElementById('phaseSelector');
    const processContent = document.getElementById('processContent');
    
    if (!selector || !processContent) return;
    
    const selectedValue = selector.value.toLowerCase();
    
    // Wait for templates to load if they haven't yet
    if (!processData[selectedValue]) {
        await loadTemplates();
    }
    
    processContent.innerHTML = processData[selectedValue] || '';
}

  
  // end of the processes load// 
  
  

  //onscroll animation //
  document.addEventListener("DOMContentLoaded", () => {
    // AOS hides every [data-aos] element with `opacity: 0` from aos.css and
    // only reveals it once aos.js has initialised and the element crosses the
    // viewport. The two files come from the same CDN, so the usual outage
    // takes both down and nothing is hidden in the first place — measured on
    // case-studies/lending-new.html: 0 invisible blocks with cdnjs fully
    // blocked.
    //
    // The dangerous case is the asymmetric one: aos.css arrives, aos.js does
    // not. Then the opacity rule is live with nothing left to turn it off, and
    // the same page measured 20 permanently invisible blocks — its entire body
    // apart from the nav, hero type and footer. Stripping the attribute is what
    // makes the CSS selector stop matching, so the content is simply un-
    // animated instead of gone.
    if (typeof AOS === "undefined" || !AOS || typeof AOS.init !== "function") {
      document.querySelectorAll("[data-aos]").forEach((el) => {
        el.removeAttribute("data-aos");
      });
      return;
    }

    AOS.init({
      duration: 800, // Animation duration in ms
      once: true,     // Animate only once
    });
  });

//end onscroll animation //


