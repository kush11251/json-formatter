# JSON Formatter & Validator

A polished JSON utility built with vanilla HTML, CSS, and JavaScript. It helps developers validate, beautify, minify, sort, and explore JSON instantly in the browser.

## Features

- Validate JSON input and display numbered error messages
- Beautify formatted JSON with proper indentation
- Minify JSON for compact output
- Sort object keys recursively for consistent structure
- Collapsible JSON tree viewer for easy inspection
- Save and load snippets from browser local storage
- Copy formatted JSON to clipboard
- Download formatted JSON as a file
- Clear current JSON input/output quickly
- Light/dark theme toggle with persistent setting
- Responsive full-screen style for portfolio and demo use

## Demo

Open `json-formatter.html` in your browser.

## Usage

1. Paste raw JSON in the input editor.
2. Click `Format & Validate` to format the JSON and check for issues.
3. Use `Minify` to compress the JSON.
4. Use `Sort JSON` to alphabetize object keys recursively.
5. Click `Copy Output` to copy the formatted JSON.
6. Click `Download` to export the formatted JSON file.
7. Click `Clear` to clear the editor and output panels.
8. Save snippets locally using the `Save` button and reload them using `Load Saved`.

## Project Files

- `json-formatter.html` — main page markup
- `style.css` — polished styling and responsive layout
- `script.js` — JSON parsing, validation, formatting, tree rendering, and storage logic
- `README.md` — documentation and usage guide

## Notes for Developers

- Works entirely in the browser with no backend required
- Uses `localStorage` to persist saved JSON snippets
- `navigator.clipboard` is used for copy-to-clipboard functionality
- Supports export via a downloaded `.json` file

## How to Run

Just open `json-formatter.html` in any modern browser or host the folder using a local static server for a nicer demo experience.

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000/json-formatter.html`.

