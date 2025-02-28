// JavaScript to handle file upload functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('jobFile');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const removeFile = document.getElementById('removeFile');
    const uploadIcon = document.getElementById('uploadIcon');
    const uploadInstructions = document.getElementById('uploadInstructions');
    
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
      
      // Show file info
      fileName.textContent = file.name;
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

// Toggle chat container visibility
document.getElementById("chatBubble").addEventListener("click", function() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.classList.toggle("visible");
});

const BACKEND_API_URL = "https://api.stpnguyen.com/api/analyze";
const RESPONSE_API_URL = "https://api.stpnguyen.com/api/job-analysis-result";

// Create loading spinner HTML
function createLoadingSpinner() {
    return `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p class="loading-text">Analyzing your job fit...</p>
            <p class="loading-subtext">This may take up to 2 minutes</p>
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
    
    // Then populate and show the result box
    resultBox.classList.add('resultBox');
    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <h3>Analysis Result</h3>
        <div class="result-score">
            <div class="score-circle">
                <span class="score-number">${data.matchScore}%</span>
            </div>
            <p class="score-label">Match Score</p>
        </div>
        <div class="result-section">
            <h4>Summary</h4>
            <p>${data.summary}</p>
        </div>
        <div class="result-section">
            <h4>Strengths</h4>
            <p>${data.strengths}</p>
        </div>
        <div class="result-section">
            <h4>Recommendations</h4>
            <div class="recommendations">
                <div class="rec-item">
                    <h5>For HR</h5>
                    <p>${data.recommendations.HR}</p>
                </div>
                <div class="rec-item">
                    <h5>For Candidate</h5>
                    <p>${data.recommendations.candidate}</p>
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

// Fixed function to check analysis result
async function checkAnalysisResult(userEmail) {
    try {
        const checkResponse = await fetch(`${RESPONSE_API_URL}?email=${encodeURIComponent(userEmail)}`);
        const data = await checkResponse.json(); // Fixed: was using 'response' which wasn't defined
  
        if (data.matchScore) {
            displayResults(data); 
        } else {
            setTimeout(() => checkAnalysisResult(userEmail), 5000);
        }
    } catch (error) {
        console.error("Error fetching analysis result:", error);
    }
}