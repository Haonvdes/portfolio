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
