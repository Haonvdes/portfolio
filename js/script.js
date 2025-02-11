


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

document.getElementById("defaultOpen").click();

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


//case study //


document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('passwordModal');
    const closeBtn = document.querySelector('.modal-icon');
    const submitBtn = document.getElementById('submitPassword');
    const passwordInput = document.getElementById('passwordInput');
    const modalError = document.getElementById('modalError');

    /**
     * Function to check if a valid JWT token exists in localStorage
     * @returns {boolean} - True if token is valid, false otherwise
     */
    const hasValidToken = () => {
        const token = localStorage.getItem('caseStudyToken');
        if (!token) return false;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(window.atob(base64));

            return payload.exp * 1000 > Date.now();
        } catch (error) {
            console.error("Invalid token format:", error);
            return false;
        }
    };

    /**
     * Function to load case study content
     * @param {string} caseStudyId - The ID of the case study
     */
    const loadCaseStudy = (caseStudyId) => {
        if (!caseStudyId) {
            console.error("Error: Invalid case study ID");
            return;
        }
        window.location.href = `case-studies/case-study-${caseStudyId}.html`;
    };

    /**
     * Event listener for case study button clicks
     */
    document.querySelectorAll('[data-case-study]').forEach(button => {
        button.addEventListener('click', (e) => {
            const caseStudyId = e.currentTarget.dataset.caseStudy; // Ensure correct dataset access
            console.log("Button Clicked: caseStudyId =", caseStudyId);

            if (caseStudyId) {
                if (hasValidToken()) {
                    loadCaseStudy(caseStudyId);
                } else {
                    // Show modal for password input
                    modal.style.display = 'block';
                    passwordInput.value = '';
                    modalError.style.display = 'none';

                    // Store case study ID for after password verification
                    modal.dataset.pendingCaseStudy = caseStudyId;
                }
            } else {
                console.error("Error: Button missing data-case-study attribute");
            }
        });
    });

    /**
     * Close modal when 'X' button is clicked
     */
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    /**
     * Close modal when clicking outside of it
     */
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    /**
     * Handle password submission
     */
    submitBtn.addEventListener('click', async () => {
        const password = passwordInput.value.trim();
        if (!password) return;

        modalError.style.display = 'none';
        submitBtn.disabled = true;

        try {
            const response = await fetch('https://portfolio-7hpb.onrender.com/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (data.success) {
                // Store the token and hide the modal
                localStorage.setItem('caseStudyToken', data.token);
                modal.style.display = 'none';

                // Retrieve and validate pending case study ID
                const caseStudyId = modal.dataset.pendingCaseStudy;
                console.log("Verified Case Study ID:", caseStudyId);

                if (caseStudyId) {
                    loadCaseStudy(caseStudyId);
                } else {
                    console.error("Error: caseStudyId is undefined or missing");
                }
            } else {
                modalError.textContent = data.message;
                modalError.style.display = 'block';
            }
        } catch (error) {
            console.error("Request failed:", error);
            modalError.textContent = 'An error occurred. Please try again later.';
            modalError.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
        }
    });

    /**
     * Handle 'Enter' key submission in password input
     */
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    });
});

























// app.js (your existing server file)
const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

// Add this new route to serve the case study content
app.get('/case-study/:id', (req, res) => {
  // Serve the case study HTML page
  res.sendFile(path.join(__dirname, 'public', 'case-study.html'));
});



