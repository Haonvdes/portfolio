function toggleChat() {
    let chatBox = document.getElementById("chatBox");
    chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
}

function showJobAnalyzer() {
    document.getElementById("jobAnalyzer").style.display = "block";
    document.getElementById("askAnything").style.display = "none";
}

function showAskAnything() {
    document.getElementById("askAnything").style.display = "block";
    document.getElementById("jobAnalyzer").style.display = "none";
}

function analyzeJob() {
    let jobTitle = document.getElementById("jobTitle").value;
    let jobDescription = document.getElementById("jobDescription").value;
    fetch("https://api.stpnguyen.com/api/analyze-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, jobDescription })
    })
    .then(res => res.json())
    .then(data => alert(`Match Score: ${data.matchScore}%\nStrengths: ${data.strengths}\nGaps: ${data.gaps}`));
}

function askPredefined() {
    let question = document.getElementById("predefinedQuestions").value;
    fetchAIResponse(question);
}

function askCustom() {
    let question = document.getElementById("customQuestion").value;
    fetchAIResponse(question);
}

function fetchAIResponse(question) {
    fetch("https://api.stpnguyen.com/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
    })
    .then(res => res.json())
    .then(data => alert(data.response));
}
