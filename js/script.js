
const storageKey = 'theme-preference'

const onClick = () => {
  // flip current value
  theme.value = theme.value === 'light'
    ? 'dark'
    : 'light'

  setPreference()
}

const getColorPreference = () => {
  if (localStorage.getItem(storageKey))
    return localStorage.getItem(storageKey)
  else
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
}

const setPreference = () => {
  localStorage.setItem(storageKey, theme.value)
  reflectPreference()
}

const reflectPreference = () => {
  document.firstElementChild
    .setAttribute('data-color-mode', theme.value)

  document
    .querySelector('#theme-toggle')
    ?.setAttribute('aria-label', theme.value)
}

const theme = {
  value: getColorPreference(),
}

// set early so no page flashes / CSS is made aware
reflectPreference()

window.onload = () => {
  // set on load so screen readers can see latest value on the button
  reflectPreference()

  // now this script can find and listen for clicks on the control
  document
    .querySelector('#theme-toggle')
    .addEventListener('click', onClick)
}

// sync with system changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({matches:isDark}) => {
    theme.value = isDark ? 'dark' : 'light'
    setPreference()
  })
        


 


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










