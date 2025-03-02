
document.getElementById("jobForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const userEmail = document.getElementById("userEmail").value;
    const jobDescription = document.getElementById("jobDescription").value;
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
                    <path d="M4 4H20V20H4V4Z" fill="gray"/>
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
            <p class="lg-medium">Analyzing your job fit...</p>
            <p class="md-medium">This may take up to 1 minutes</p>
        </div>
    `;
}

// Display results function
function displayResults(data) {
    const resultBox = document.getElementById("resultBox");
    const responseMessage = document.getElementById("responseMessage");
    
    // First show the response message container
    responseMessage.style.display = "block";
    responseMessage.textContent = "Analysis complete!";

    // Determine the background and score color based on matchScore
    let bgColor = "red"; // Default red
    let scoreColor = "red";
    
    if (data.matchScore > 65) {
        bgColor = "green";
        scoreColor = "green";
    } else if (data.matchScore > 50) {
        bgColor = "yellow";
        scoreColor = "yellow";
    }
    
    
    
    // Then populate and show the result box
    resultBox.classList.add('resultBox');
    resultBox.style.display = "block";
    resultBox.style.backgroundColor = bgColor; // Apply background color
    resultBox.innerHTML = `
        <h3>Assessment Result</h3>
        <div class="snap-shot">
            <div class="snap-item" style="color:${bgColor};>
                <span class="display" style="color:${scoreColor};>${data.matchScore}</span>
                <p class="md-medium">${data.exclamation}</p>
            </div>
            <div class="snap-item">
                <p class="md-medium">${data.summary}</p>
                <a href="mailto:stpnguyen.info@gmail.com" class="btn-primary btn-primary sm-medium">Email to Stephano</a>
            </div>
         </div>
        <div class="result-section">
            <h4 class="md-bold">Strengths</h4>
            <p class="md-medium">${data.strengths}</p>
        </div>
          <div class="result-section">
            <h4 class="md-bold">Potential</h4>
            <p class="md-medium">${data.potential}</p>
        </div>
        <div class="result-section">
            <h4 class="md-bold">Recommendations</h4>
            <div class="recommendations">
                <div class="rec-item">
                    <p class="md-medium">For HR</p>
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
    
    // Show response message with error
    responseMessage.style.display = "block";
    responseMessage.textContent = "Error fetching analysis results.";
    
    // Show result box with error details
    resultBox.classList.add('resultBox');
    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <div class="error-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 7V13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
            </svg>
            <p>${errorMessage}</p>
            <button id="retryButton" class="btn-secondary">Try Again</button>
        </div>
    `;
    
    // Add retry button functionality
    document.getElementById("retryButton").addEventListener("click", function() {
        // Re-enable the submit button
        submitButton.disabled = false;
        
        // Clear the result box and response message
        resultBox.innerHTML = "";
        resultBox.style.display = "none";
        responseMessage.textContent = "";
        responseMessage.style.display = "none";
    });
}






