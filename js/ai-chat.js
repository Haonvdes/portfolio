document.getElementById("jobForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    // Run all validations
    const isEmailValid = validateEmail();
    const isFormValid = validateForm();
    
    if (!isEmailValid || !isFormValid) {
        return; // Stop if validation fails
    }
    
    // Get form elements
    const userEmail = document.getElementById("userEmail").value.trim();
    const jobDescription = document.getElementById("jobDescription").value.trim();
    const fileInput = document.getElementById("jobFile");
    const responseMessage = document.getElementById("responseMessage");
    const resultBox = document.getElementById("resultBox");
    const submitButton = document.querySelector('#jobForm button[type="submit"]');
    
    // Initially hide response message and result box
    responseMessage.style.display = "none";
    resultBox.style.display = "none";
    resultBox.innerHTML = "";
    resultBox.className = ""; // Remove any previous classes
    
    // Show loading state in result box only
    resultBox.style.display = "block";
    resultBox.innerHTML = createLoadingSpinner();
    
    // Disable submit button to prevent multiple submissions
    submitButton.disabled = true;

    const formData = new FormData();
    formData.append("userEmail", userEmail);
    formData.append("jobDescription", jobDescription);
    if (fileInput.files.length > 0) {
        formData.append("jobFile", fileInput.files[0]);
    }

    try {
        // Step 1: Send request to backend
        const backendResponse = await fetch(BACKEND_API_URL, {
            method: "POST",
            body: formData
        });
        
        if (!backendResponse.ok) {
            throw new Error("Failed to send data to backend.");
        }
        
        // Update loading state with progress
        document.querySelector('.loading-text').textContent = "Analyzing job requirements...";
        
        // Step 2: Poll backend for results
        let attempts = 0;
        const maxAttempts = 15; // Increased from 10 to allow more time
        let data = null;
        
        const checkResult = async () => {
            if (attempts >= maxAttempts) {
                throw new Error("Analysis is taking longer than expected. Please check your email for results later.");
            }
            
            attempts++;
            
            // Update loading progress based on attempts
            const progress = Math.min(Math.floor((attempts / maxAttempts) * 100), 95);
            document.querySelector('.loading-subtext').textContent = `Progress: ${progress}% complete`;
            
            try {
                const checkResponse = await fetch(`${RESPONSE_API_URL}?email=${encodeURIComponent(userEmail)}`);
                
                if (checkResponse.ok) {
                    const responseData = await checkResponse.json();
                    if (responseData && responseData.matchScore) {
                        return responseData;
                    }
                }
                
                // Wait and try again
                await new Promise(resolve => setTimeout(resolve, 8000)); // 8 seconds between checks
                return await checkResult();
            } catch (error) {
                console.error("Error checking result:", error);
                await new Promise(resolve => setTimeout(resolve, 8000));
                return await checkResult();
            }
        };
        
        // Start polling for results
        data = await checkResult();
        
        // Display results when available
        if (data && data.matchScore) {
            displayResults(data);
        } else {
            throw new Error("No valid response from the backend.");
        }
    } catch (error) {
        displayError(error.message);
    }
});


// Toggle chat container visibility
document.getElementById("chatBubble").addEventListener("click", function() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.classList.toggle("visible");
});

const BACKEND_API_URL = "https://api.stpnguyen.com/api/analyze";
const RESPONSE_API_URL = "https://api.stpnguyen.com/api/job-analysis-result";

// Fixed function to check analysis result
async function checkAnalysisResult(userEmail) {
    try {
        const checkResponse = await fetch(`${RESPONSE_API_URL}?email=${encodeURIComponent(userEmail)}`);
        const data = await checkResponse.json(); // Fixed: was using 'response' which wasn't defined
  
        if (data.matchScore) {
            displayResults(data); 
        } else {
            setTimeout(() => checkAnalysisResult(userEmail), 10000);
        }
    } catch (error) {
        console.error("Error fetching analysis result:", error);
    }
}


// JavaScript to handle file upload functionality with file type icons
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('jobFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const fileIconContainer = document.getElementById('fileIconContainer');
    const removeFile = document.getElementById('removeFile');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadInstructions = document.getElementById('uploadInstructions');
    
    // Function to get appropriate icon based on file extension
    function getFileIcon(fileExtension) {
        // Convert extension to lowercase for comparison
        const ext = fileExtension.toLowerCase();
        
        // Return appropriate icon SVG based on file type
        if (ext === 'pdf') {
            return `
            <img src="/public/ic_pdf.svg" class="file-icon" width="16" height="16" alt="PDF Icon">    
            `;
        } else if (['doc', 'docx'].includes(ext)) {
            return `
                        <img src="/public/ic_docs.svg" class="file-icon" width="16" height="16" alt="PDF Icon">    

            `;
        } else {
            return `
                <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Default icon -->
                    <path d="M4 4H20V20pV4Z" fill="gray"/>
                </svg>`;
        }
    }
    
    // Make the entire dropZone clickable to trigger file input
    dropZone.addEventListener('click', function(e) {
      if (e.target !== removeFile && !removeFile.contains(e.target)) {
        fileInput.click();
      }
    });
    
    // Handle drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
      dropZone.classList.add('bg-blue-50');
      dropZone.style.borderColor = '#4f46e5';
    }
    
    function unhighlight() {
      dropZone.classList.remove('bg-blue-50');
      dropZone.style.borderColor = '#d1d5db';
    }
    
    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      fileInput.files = files;
      handleFiles(files);
    }
    
    // Handle file selection via input
    fileInput.addEventListener('change', function() {
      handleFiles(this.files);
    });
    
    function handleFiles(files) {
      if (files.length > 0) {
        displayFileInfo(files[0]);
      }
    }
    
    function displayFileInfo(file) {
      // Hide upload icon and instructions
      uploadIcon.style.display = 'none';
      uploadInstructions.style.display = 'none';
      
      // Get file extension
      const fileParts = file.name.split('.');
      const fileExtension = fileParts.length > 1 ? fileParts[fileParts.length - 1] : '';
      
      // Show file info with appropriate icon
      fileName.textContent = file.name;
      
      // Check if fileIconContainer exists, if not create it
      if (!fileIconContainer) {
        // Create a new container for the file icon
        const iconContainer = document.createElement('div');
        iconContainer.id = 'fileIconContainer';
        iconContainer.className = 'file-icon-container';
        
        // Find the file info content div
        const fileInfoContent = document.querySelector('.file-info-content');
        
        // Insert the icon container before the file name in the DOM
        const fileNameContainer = document.querySelector('.file-name');
        fileInfoContent.insertBefore(iconContainer, fileNameContainer);
      }
      
      // Update the icon based on file extension
      document.getElementById('fileIconContainer').innerHTML = getFileIcon(fileExtension);
      
      fileInfo.style.display = 'block';
    }
    
    // Handle file removal
    removeFile.addEventListener('click', function(e) {
      e.stopPropagation();
      fileInput.value = '';
      
      // Hide file info
      fileInfo.style.display = 'none';
      
      // Show upload icon and instructions again
      uploadIcon.style.display = 'block';
      uploadInstructions.style.display = 'block';
    });
});


// Create loading spinner HTML
function createLoadingSpinner() {
    return `
       <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text lg-bold">Analyzing your job fit...</p>
            <p class="loading-subtext md-medium">This may take up to 1 minutes</p>
        </div>
    `;
}

// Display results function
function displayResults(data) {
    const resultBox = document.getElementById("resultBox");
    const responseMessage = document.getElementById("responseMessage");
    
    // First show the response message container
    responseMessage.style.display = "block";
    responseMessage.textContent = "Analysis complete! Check it out right below.";

    // Determine the background and score color based on matchScore
    let bgColor = "var(--red-R100)"; // Default red
    let scoreColor = " var(--red-R700)";
    
    if (data.matchScore > 65) {
        bgColor = "var(--emerald-E100)";
        scoreColor = "var(--emerald-E700)";
    } else if (data.matchScore > 50) {
        bgColor = "var(--yellow-Y100)";
        scoreColor = "var(--yellow-Y700)";
    }
    
    
    
    // Then populate and show the result box
    resultBox.classList.add('resultBox');
    resultBox.style.display = "block";
    // resultBox.style.backgroundColor = bgColor; // Apply background color
    resultBox.innerHTML = `
           <div class="snap-shot">
             <h3>Assessment Result</h3>
            <div class="snap-shot-sum">
                <div class="snap-item-score" style="background-color:${bgColor};">
                    <span class="display" style="color:${scoreColor};">${data.matchScore}</span>
                    <p class="md-medium" style="color:${scoreColor};">${data.exclamation}</p>
                </div>
                <div class="snap-item-sum">
                    <p class="md-bold">Summary</p>
                    <p class="md-medium">${data.summary}</p>
                    <button class="btn-primary" onclick="window.location.href='mailto:stpnguyen.info@gmail.com'" style="width: fit-content; font-size: 14px;">Email to Stephano</button>        
                </div>
        </div>
           </div>

        <div class="result-section">
            <p class="md-bold">Strengths</p>
            <p class="md-medium">${data.strengths}</p>
        </div>
         <div class="result-section">
            <p class="md-bold">Skills</p>
            <p class="md-medium">${data.skill}</p>
        </div>
          <div class="result-section">
            <p class="md-bold">Potential</p>
            <p class="md-medium">${data.potential}</p>
        </div>
                <div class="result-section">
            <p class="md-bold">Certificate</p>
            <div style="display: flex; flex-direction: row; gap: 16px;">
                    <div class="tooltip-container" data-tooltip="Professional Project Management">                        
                        
                        <a href="https://www.credly.com/badges/ab2290b3-212e-4db2-8a89-53bff99a7db4/public_url" target="_blank">
                            <img src="./public/cert_pmp.png" alt="certificate_pmp" style="width: 40px; height: 40px;">
                        </a>

                    </div>
                    <div class="tooltip-container" data-tooltip="Agile Certified Practitioner">                        
                        
                        <a href="https://www.credly.com/badges/97dcfae2-dbce-4e6b-86fb-e76c17cd6bf0/public_url" target="_blank">
                            <img src="./public/cert_agile.png" alt="certificate_agile" style="width: 40px; height: 40px;">                        
                        </a>

                    </div>
                    <div class="tooltip-container" data-tooltip="Practical Application of Gen AI">                        
                        <a href="https://www.credly.com/badges/3ab5df38-46de-415f-a9e6-531fc9f78718/public_url" target="_blank">
                            <img src="./public/cert_promtEn.png" alt="certificate_AI" style="width: 40px; height: 40px; border-radius: 0;">
                        </a>
                    </div>
                    <div class="tooltip-container" data-tooltip="Prompt Engineering for Project Managers">
                        <a href="https://www.credly.com/badges/68c137b7-52ec-4bfb-a072-e68d977eeff3/public_url" target="_blank">
                            <img src="./public/cert_promtEn.png" alt="certificate_AI" style="width: 40px; height: 40px; border-radius: 0;">                        
                        </a>                        
                        
                    </div>
                    <div class="tooltip-container" data-tooltip="Professional Scrum Master">                        
                        <a href="https://www.credly.com/badges/6fbbbe85-014a-4689-8433-b05a1383e851/public_url" target="_blank">
                            <img src="./public/cert_psm.png" alt="certificate_PSM" style="width: 40px; height: 40px;">
                        </a>
                    </div>
                <div class="tooltip" id="tooltip" style="visibility: hidden; opacity: 0; display: flex; align-items: center; padding: 16px; top: 883px; left: 100.5px;">Professional Project Management</div>
                </div>
        </div>
        <div class="result-section">
            <p class="md-bold">Recommendations</p>
            <div class="recommendations">
                <div class="rec-item">
                    <p class="md-medium">${data.recommendations}</p>
                </div>
            </div>
        </div>
    `;
    
    // Add success class to result box for styling
    resultBox.classList.add('success');
    
    // Enable the submit button again
    document.querySelector('#jobForm button[type="submit"]').disabled = false;
}

// Display error function
function displayError(errorMessage) {
    const resultBox = document.getElementById("resultBox");
    const responseMessage = document.getElementById("responseMessage");
    const submitButton = document.querySelector('#jobForm button[type="submit"]');
    
    // Reset previous states
    if (submitButton) submitButton.disabled = false;
    
    // Update response message
    if (responseMessage) {
        responseMessage.style.display = "block";
        responseMessage.style.color = "var(--red-R600)";
        responseMessage.textContent = "Oops! Something went wrong; check your information and try to load again.";
    }
    
    // Update result box with error
    if (resultBox) {
        resultBox.innerHTML = `
            <div class="error-container">
                <button id="retryButton" class="btn-secondary">Try Again</button>
            </div>
        `;
        resultBox.style.display = "block";
        
        // Add retry button event listener
        const retryButton = document.getElementById("retryButton");
        if (retryButton) {
            retryButton.addEventListener("click", resetForm);
        }
    }
}

function resetForm() {
    const resultBox = document.getElementById("resultBox");
    const responseMessage = document.getElementById("responseMessage");
    const submitButton = document.querySelector('#jobForm button[type="submit"]');
    
    // Reset form elements
    if (submitButton) submitButton.disabled = false;
    if (resultBox) {
        resultBox.innerHTML = "";
        resultBox.style.display = "none";
    }
    if (responseMessage) {
        responseMessage.textContent = "";
        responseMessage.style.display = "none";
    }
}

// Add input event listeners for inline validation
document.getElementById("userEmail").addEventListener("input", validateEmail);
document.getElementById("jobDescription").addEventListener("input", validateForm);
document.getElementById("jobFile").addEventListener("change", validateForm);

// Email validation function
function validateEmail() {
    const userEmail = document.getElementById("userEmail");
    const emailError = document.getElementById("emailError") || createErrorElement("emailError", userEmail);
    const email = userEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showError(emailError, "Email is required");
        userEmail.classList.add("error");
        return false;
    } else if (!emailRegex.test(email)) {
        showError(emailError, "Please enter a valid email address");
        userEmail.classList.add("error");
        return false;
    } else {
        hideError(emailError);
        userEmail.classList.remove("error");
        return true;
    }
}

// Form validation function
function validateForm() {
    const jobDescription = document.getElementById("jobDescription");
    const fileInput = document.getElementById("jobFile");
    const requirementError = document.getElementById("requirementError") || 
                           createErrorElement("requirementError", jobDescription);
    
    if (!jobDescription.value.trim() && fileInput.files.length === 0) {
        showError(requirementError, "Please provide either a job description or upload a file");
        jobDescription.classList.add("error");
        return false;
    } else {
        hideError(requirementError);
        jobDescription.classList.remove("error");
        return true;
    }
}

// Helper function to create error element
function createErrorElement(id, targetElement) {
    const errorDiv = document.createElement("div");
    errorDiv.id = id;
    errorDiv.className = "error-message";
    errorDiv.style.display = "none";
    targetElement.parentNode.insertBefore(errorDiv, targetElement.nextSibling);
    return errorDiv;
}

// Helper function to show error
function showError(errorElement, message) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    errorElement.style.margintop = "4px";
    errorElement.style.padding = "0";
    errorElement.classList.add('sm-medium');


}

// Helper function to hide error
function hideError(errorElement) {
    errorElement.style.display = "none";
}