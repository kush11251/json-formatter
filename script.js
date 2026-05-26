const jsonInput = document.getElementById('jsonInput');
const jsonOutput = document.getElementById('jsonOutput');
const jsonTree = document.getElementById('jsonTree');
const errorBox = document.getElementById('errorBox');
const successMsg = document.getElementById('successMsg');
const savedItemsContainer = document.getElementById('savedItemsContainer');
const themeBtn = document.getElementById('themeBtn');
const formatBtn = document.getElementById('formatBtn');
const minifyBtn = document.getElementById('minifyBtn');
const sortBtn = document.getElementById('sortBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');
const toggleSavedBtn = document.getElementById('toggleSavedBtn');
const clearStorageBtn = document.getElementById('clearStorageBtn');

function collectSyntaxIssues(input) {
    const errors = [];
    if (!input.trim()) {
        errors.push('Input is empty.');
        return errors;
    }

    let stack = [];
    let inString = false;
    let escaped = false;

    for (let i = 0; i < input.length; i++) {
        const char = input[i];

        if (char === '\\' && inString) {
            escaped = !escaped;
            continue;
        }

        if (char === '"' && !escaped) {
            inString = !inString;
        }

        if (!inString) {
            if (char === '{' || char === '[') {
                stack.push(char);
            }
            if (char === '}' || char === ']') {
                const expected = char === '}' ? '{' : '[';
                const last = stack[stack.length - 1];
                if (last === expected) {
                    stack.pop();
                } else {
                    errors.push(`Unexpected closing ${char} at position ${i + 1}.`);
                }
            }
        }

        if (char !== '\\') {
            escaped = false;
        }
    }

    if (inString) {
        errors.push('Unterminated string detected.');
    }

    if (stack.length) {
        const missing = stack.map(c => (c === '{' ? '}' : ']')).join(', ');
        errors.push(`Missing closing bracket(s): ${missing}.`);
    }

    const trailingCommaMatches = input.match(/,\s*(?=[}\]])/g);
    if (trailingCommaMatches) {
        errors.push('Trailing comma found before a closing bracket.');
    }

    const unquotedKeyMatches = input.match(/\{\s*([a-zA-Z0-9_\$]+)\s*:/g);
    if (unquotedKeyMatches) {
        const sample = unquotedKeyMatches[0].replace('{', '').replace(':', '').trim();
        errors.push(`Possible unquoted key detected: ${sample}.`);
    }

    return [...new Set(errors)];
}

function validateAndParse(inputString) {
    const issues = collectSyntaxIssues(inputString);
    try {
        const data = JSON.parse(inputString);
        return { valid: true, data, issues };
    } catch (err) {
        const parseMessage = err.message || 'Invalid JSON syntax.';
        const resultErrors = issues.length ? issues : [parseMessage];
        if (!issues.length) {
            resultErrors.push(parseMessage);
        }
        return { valid: false, error: resultErrors };
    }
}

function displayErrors(errors) {
    if (!errors || !errors.length) {
        errorBox.style.display = 'none';
        return;
    }

    errorBox.style.display = 'block';
    errorBox.innerHTML = '<strong>❌ Validation Errors:</strong><ol>' +
        errors.map(message => `<li>${message}</li>`).join('') +
        '</ol>';
}

function renderJsonTree(data) {
    jsonTree.innerHTML = '';
    if (data === null || typeof data !== 'object') {
        const message = document.createElement('div');
        message.className = 'leaf-node';
        message.textContent = JSON.stringify(data);
        jsonTree.appendChild(message);
        return;
    }

    jsonTree.appendChild(createTreeNode(data, 'Root'));
}

function createTreeNode(value, label) {
    const container = document.createElement('div');
    container.className = 'tree-node';

    if (value && typeof value === 'object') {
        const details = document.createElement('details');
        details.open = true;

        const summary = document.createElement('summary');
        const labelText = Array.isArray(value)
            ? `${label} - Array[${value.length}]`
            : `${label} - Object`;
        summary.innerHTML = `<span>${labelText}</span>`;
        details.appendChild(summary);

        const children = document.createElement('div');
        children.className = 'child-nodes';

        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                children.appendChild(createTreeNode(item, `Index ${index}`));
            });
        } else {
            Object.keys(value).forEach(key => {
                children.appendChild(createTreeNode(value[key], key));
            });
        }

        details.appendChild(children);
        container.appendChild(details);
    } else {
        const line = document.createElement('div');
        line.className = 'leaf-node';
        const formatted = JSON.stringify(value);
        line.textContent = `${label}: ${formatted}`;
        container.appendChild(line);
    }

    return container;
}

function updateOutput(result, options = {}) {
    if (!result.valid) {
        displayErrors(result.error);
        jsonOutput.textContent = '';
        jsonTree.innerHTML = '';
        successMsg.style.display = 'none';
        return;
    }

    displayErrors([]);
    successMsg.style.display = 'inline';
    successMsg.textContent = 'Valid JSON ✓';

    let outputText = options.minify
        ? JSON.stringify(result.data)
        : JSON.stringify(result.data, null, 4);

    jsonOutput.textContent = outputText;
    renderJsonTree(result.data);
    if (options.normalizeInput) {
        jsonInput.value = outputText;
    }
}

function formatJSON() {
    const result = validateAndParse(jsonInput.value);
    updateOutput(result, { normalizeInput: true });
}

function minifyJSON() {
    const result = validateAndParse(jsonInput.value);
    updateOutput(result, { minify: true, normalizeInput: false });
}

function clearEditor() {
    jsonInput.value = '';
    jsonOutput.textContent = '';
    jsonTree.innerHTML = '';
    errorBox.style.display = 'none';
    successMsg.style.display = 'none';
}

function copyOutput() {
    const text = jsonOutput.textContent.trim();
    if (!text) {
        alert('Nothing to copy. Please format or validate JSON first.');
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => alert('Formatted JSON copied to clipboard!'))
        .catch(() => alert('Could not copy output.'));
}

function downloadJSON() {
    const text = jsonOutput.textContent.trim();
    if (!text) {
        alert('Nothing to download. Format the JSON before exporting.');
        return;
    }
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function sortJSON() {
    const result = validateAndParse(jsonInput.value);
    if (!result.valid) {
        updateOutput(result);
        return;
    }
    const sorted = sortValue(result.data);
    const formatted = JSON.stringify(sorted, null, 4);
    jsonInput.value = formatted;
    updateOutput({ valid: true, data: sorted }, { normalizeInput: false });
}

function sortValue(value) {
    if (Array.isArray(value)) {
        return value.map(sortValue);
    }
    if (value && typeof value === 'object') {
        const sortedKeys = Object.keys(value).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
        return sortedKeys.reduce((acc, key) => {
            acc[key] = sortValue(value[key]);
            return acc;
        }, {});
    }
    return value;
}

function getSavedJSONs() {
    try {
        return JSON.parse(localStorage.getItem('savedJSONs') || '[]');
    } catch {
        localStorage.removeItem('savedJSONs');
        return [];
    }
}

function saveJSON() {
    const result = validateAndParse(jsonInput.value);
    if (!result.valid) {
        alert('Cannot save! The JSON contains errors. Please validate and fix it first.');
        updateOutput(result);
        return;
    }

    const name = prompt('Enter a name for this JSON snippet:', `Snippet ${new Date().toLocaleTimeString()}`);
    if (!name) return;

    const saved = getSavedJSONs();
    saved.push({ id: Date.now(), name, data: jsonInput.value });
    localStorage.setItem('savedJSONs', JSON.stringify(saved));
    renderSavedItems();
}

function toggleSavedItems() {
    const isHidden = savedItemsContainer.style.display === 'none' || savedItemsContainer.style.display === '';
    savedItemsContainer.style.display = isHidden ? 'block' : 'none';
    if (isHidden) renderSavedItems();
}

function renderSavedItems() {
    const saved = getSavedJSONs();
    if (!saved.length) {
        savedItemsContainer.innerHTML = '<p style="text-align:center; opacity:0.7;">No saved JSONs found.</p>';
        return;
    }

    savedItemsContainer.innerHTML = saved
        .slice()
        .reverse()
        .map(item => `
            <div class="saved-item" data-id="${item.id}">
                <span>📄 ${item.name}</span>
                <button class="delete-item" data-delete-id="${item.id}">Delete</button>
            </div>
        `)
        .join('');

    savedItemsContainer.querySelectorAll('.saved-item').forEach(card => {
        card.addEventListener('click', () => loadItem(Number(card.dataset.id)));
    });

    savedItemsContainer.querySelectorAll('[data-delete-id]').forEach(button => {
        button.addEventListener('click', event => {
            event.stopPropagation();
            deleteItem(Number(button.dataset.deleteId));
        });
    });
}

function loadItem(id) {
    const item = getSavedJSONs().find(i => i.id === id);
    if (!item) return;
    jsonInput.value = item.data;
    formatJSON();
}

function deleteItem(id) {
    const saved = getSavedJSONs().filter(item => item.id !== id);
    localStorage.setItem('savedJSONs', JSON.stringify(saved));
    renderSavedItems();
}

function clearStorage() {
    if (confirm('Are you sure you want to clear all saved JSON snippets?')) {
        localStorage.removeItem('savedJSONs');
        renderSavedItems();
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeBtn.textContent = theme === 'light' ? '🌙' : '☀️';
}

window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    renderSavedItems();

    formatBtn.addEventListener('click', formatJSON);
    minifyBtn.addEventListener('click', minifyJSON);
    sortBtn.addEventListener('click', sortJSON);
    copyBtn.addEventListener('click', copyOutput);
    downloadBtn.addEventListener('click', downloadJSON);
    clearBtn.addEventListener('click', clearEditor);
    saveBtn.addEventListener('click', saveJSON);
    toggleSavedBtn.addEventListener('click', toggleSavedItems);
    clearStorageBtn.addEventListener('click', clearStorage);
    themeBtn.addEventListener('click', toggleTheme);
});
