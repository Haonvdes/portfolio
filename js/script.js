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
                    menu.classList.toggle("active");
                    menuToggle.classList.toggle("active");
                });
                console.log("Menu toggle event listener added successfully.");
            } else {
                console.error("Menu toggle elements not found.");
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
    
    // Only initialize password modal on work.html
    if (window.location.pathname.includes('work.html')) {
        initializePasswordModal();
    }
    
    // Initialize Swiper if the container exists
    if (document.querySelector('.swiper-container')) {
        const swiper = new Swiper('.swiper-container', {
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
  
  // Password modal
  function initializePasswordModal() {
      const modal = document.getElementById('passwordModal');
      const closeBtn = document.querySelector('.modal-icon');
      const submitBtn = document.getElementById('submitPassword');
      const passwordInput = document.getElementById('passwordInput');
      const modalError = document.getElementById('modalError');
  
      if (!modal || !closeBtn || !submitBtn || !passwordInput || !modalError) {
          console.warn('Password modal elements not found');
          return;
      }
  
      // Function to check if the user has a valid JWT token
      const hasValidToken = () => {
          const token = sessionStorage.getItem('caseStudyToken');
          if (!token) return false;
  
          try {
              const base64Url = token.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(window.atob(base64));
  
              return payload?.exp && payload.exp * 1000 > Date.now();
          } catch (error) {
              console.error("Error decoding JWT:", error);
              return false;
          }
      };
  
      // Function to close modal
      const closeModal = () => {
          modal.style.display = 'none';
      };
  
      // Close button click handler
      closeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeModal();
      });
  
      // Close modal when clicking outside
      window.addEventListener('click', (event) => {
          if (event.target === modal) {
              modal.style.display = 'none';
          }
      });
  
// Function to load the case study content
const loadCaseStudy = (caseStudyName) => {
    const formattedName = caseStudyName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `case-studies/${formattedName}.html`;
};

// Event listener for case study buttons
document.querySelectorAll('[data-case-study]').forEach(button => {
    button.addEventListener('click', (e) => {
        const caseStudyName = e.currentTarget.dataset.caseStudy;

        if (!caseStudyName) {
            console.error("Error: Button missing data-case-study attribute");
            return;
        }

        console.log("Button Clicked: caseStudyName =", caseStudyName);

        if (hasValidToken()) {
            loadCaseStudy(caseStudyName);
        } else {
            modal.style.display = 'block';
            passwordInput.value = '';
            modalError.style.display = 'none';
            modal.dataset.pendingCaseStudy = caseStudyName;
        }
    });
});

  
      // Handle password submission
      submitBtn.addEventListener('click', async () => {
          const password = passwordInput.value;
          modalError.style.display = 'none';
          submitBtn.disabled = true;
  
          try {
              const response = await fetch('https://api.stpnguyen.com/api/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password })
              });
  
              const data = await response.json();
  
              if (data.success) {
                  sessionStorage.setItem('caseStudyToken', data.token);
                  modal.style.display = 'none';
  
                  const caseStudyName = modal.dataset.pendingCaseStudy;
                  if (caseStudyName && caseStudyName !== "undefined") {
                      loadCaseStudy(caseStudyName);
                  } else {
                      console.error("Error: caseStudyName is undefined or invalid");
                  }
              } else {
                  modalError.textContent = data.message;
                  modalError.style.display = 'block';
              }
          } catch (error) {
              console.error("Error verifying password:", error);
              modalError.textContent = 'Something went wrong, trying to load again shortly.';
              modalError.style.display = 'block';
          } finally {
              submitBtn.disabled = false;
          }
      });
  
      // Handle Enter key in password input
      passwordInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
              submitBtn.click();
          }
      });
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

// Function to load an HTML file
async function loadTemplate(name) {
    const response = await fetch(`./templates/${name}.html`);
    return response.text();
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
    AOS.init({
      duration: 800, // Animation duration in ms
      once: true,     // Animate only once
    });
  });

//end onscroll animation //

  

//   const jwt = require('jsonwebtoken');
  const path = require('path');
  const app = express();
  
  app.use(express.json());
  app.use(express.static('public'));
  // Add this new route to serve the case study content
  app.get('/case-study/:id', (req, res) => {
    // Serve the case study HTML page
    res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
  });





