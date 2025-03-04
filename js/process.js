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
