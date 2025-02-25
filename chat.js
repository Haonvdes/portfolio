const BACKEND_API_URL = "https://api.stpnguyen.com/api/job-analysis";

document.getElementById("jobForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const jobDescription = document.getElementById("jobDescription").value;
    const userEmail = document.getElementById("userEmail").value;
    const responseMessage = document.getElementById("responseMessage");
    const resultBox = document.getElementById("resultBox");

    responseMessage.textContent = "Processing...";
    resultBox.innerHTML = "";

    try {
        // Step 1: Send request to Make.com Webhook
        await fetch("https://hook.us2.make.com/m6ee17ppddwuttuz2cef9ey9xxqjm1fc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jobDescription, userEmail })
        });

        responseMessage.textContent = "Processing... Fetching results soon.";

        // Step 2: Poll backend for results
        let attempts = 0;
        let data = null;

        while (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 sec before retry
            const backendResponse = await fetch(`${BACKEND_API_URL}?email=${encodeURIComponent(userEmail)}`);
            
            if (backendResponse.ok) {
                data = await backendResponse.json();
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
