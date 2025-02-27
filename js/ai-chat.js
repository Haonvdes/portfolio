// Toggle chat container visibility
document.getElementById("chatBubble").addEventListener("click", function() {
    const chatContainer = document.getElementById("chatContainer");
    chatContainer.classList.toggle("visible");
});

const BACKEND_API_URL = "https://api.stpnguyen.com/api/analyze";
const RESPONSE_API_URL = "https://api.stpnguyen.com/api/job-analysis-result";



document.getElementById("jobForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const userEmail = document.getElementById("userEmail").value;
    const jobDescription = document.getElementById("jobDescription").value;
    const fileInput = document.getElementById("jobFile");
    const responseMessage = document.getElementById("responseMessage");
    const resultBox = document.getElementById("resultBox");

    responseMessage.textContent = "Processing...";
    resultBox.innerHTML = "";

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
        
        responseMessage.textContent = "Processing... Fetching results soon.";
        
        // Step 2: Poll backend for results
        let attempts = 0;
        let data = null;

        while (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 20000));            // Wait 5 sec before retry
            const checkResponse = await fetch(`${RESPONSE_API_URL}?email=${encodeURIComponent(userEmail)}`);
            
            if (checkResponse.ok) {
                data = await checkResponse.json();
                break;
            }

            attempts++;
        }

        // Step 3: Display results
        if (data && data.matchScore) {
            resultBox.innerHTML = `
                <h3>Analysis Result</h3>
                <p><strong>Match Score:</strong> ${data.matchScore}%</p>
                <p><strong>Summary:</strong> ${data.summary}</p>
                <h4>Recommendations</h4>
                <p><strong>For HR:</strong> ${data.recommendations.HR}</p>
                <p><strong>For Candidate:</strong> ${data.recommendations.candidate}</p>
            `;
            responseMessage.textContent = "Analysis complete!";
        } else {
            throw new Error("No valid response from the backend.");
        }
    } catch (error) {
        responseMessage.textContent = "Error fetching analysis results. Please try again.";
        resultBox.innerHTML = `<p>${error.message}</p>`;
    }
});

async function checkAnalysisResult(userEmail) {
    try {
        const checkResponse = await fetch(`${RESPONSE_API_URL}?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();
  
      if (data.matchScore) {
        displayResults(data); // Function to update UI
      } else {
        setTimeout(() => checkAnalysisResult(userEmail), 5000); // Retry after 5 sec
      }
    } catch (error) {
      console.error("Error fetching analysis result:", error);
    }
  }
  