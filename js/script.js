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
  const closeBtn = document.getElementsByClassName('modal-icon')[0];
  const submitBtn = document.getElementById('submitPassword');
  const passwordInput = document.getElementById('passwordInput');
  const modalError = document.getElementById('modalError');
  const togglePassword = document.getElementById('togglePassword');
  
  function toggleScrollLock(lock) {
    document.body.style.overflow = lock ? 'hidden' : 'auto';
  }

  // Open modal and block scroll
  document.getElementById('case-study').addEventListener('click', () => {
    modal.style.display = 'block';
    passwordInput.value = '';
    modalError.style.display = 'none';
    toggleScrollLock(true);
  });

  // Toggle password visibility
  togglePassword.addEventListener('click', () => {
    const passwordInput = document.getElementById('passwordInput');
    const icon = togglePassword.querySelector('i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });

  // Handle password submission
  submitBtn.onclick = async () => {
    const password = passwordInput.value;
    modalError.style.display = 'none';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();
      
      if (data.success) {
        const token = data.token;
        localStorage.setItem('caseStudy_token', token);
        modal.style.display = 'none';
        toggleScrollLock(false);
        
        // Load case study in current window
        window.location.href = `/case-study/1?token=${token}`;
      } else {
        modalError.textContent = data.message;
        modalError.style.display = 'block';
      }
    } catch (error) {
      modalError.textContent = 'Server error. Please try again later.';
      modalError.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
    }
  };

  // Close modal handlers with scroll unlock
  closeBtn.onclick = () => {
    modal.style.display = 'none';
    toggleScrollLock(false);
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      toggleScrollLock(false);
    }
  };

  // Handle Enter key
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







