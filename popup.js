let capturedElements = [];
let selectedElement = null;

const manualPromptContainer = document.getElementById(
    "manual-prompt-container"
);

const manualPromptInput = document.createElement("input");
manualPromptInput.setAttribute("type", "text");
manualPromptInput.setAttribute("placeholder", "Enter a manual prompt");
manualPromptContainer.appendChild(manualPromptInput);

function setSelectedElement(event) {
    if (event.target && event.target.nodeName === "SPAN") {
        if (selectedElement) {
            selectedElement.style.backgroundColor = "";
            selectedElement.style.cursor = "";
        }

        selectedElement = event.target;
        selectedElement.style.backgroundColor = "#ADD8E6";
        selectedElement.style.cursor = "pointer";
    }
}

document.addEventListener("mouseup", function (event) {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedElement = range.commonAncestorContainer.parentElement;
    setSelectedElement(selectedElement);
});

function updatePopup() {
    const capturedElementsList = document.getElementById(
        "captured-elements-list"
    );
    capturedElementsList.innerHTML = "";

    for (let i = 0; i < capturedElements.length; i++) {
        const element = capturedElements[i];

        const item = document.createElement("li");
        item.classList.add("captured-element");

        const title = document.createElement("div");
        title.classList.add("title");
        title.textContent = `Captured from ${element.url}`;

        const content = document.createElement("div");
        content.classList.add("content");
        content.textContent = element.text;

        const timestamp = document.createElement("div");
        timestamp.classList.add("timestamp");
        timestamp.textContent = new Date(element.timestamp).toLocaleString();

        item.appendChild(title);
        item.appendChild(content);
        item.appendChild(timestamp);

        capturedElementsList.appendChild(item);
    }
}

function saveCapturedElement() {
    const prompt = confirm(
        "Use the selected element as the prompt for generated text?"
    );
    if (typeof selectedElement !== "undefined" && selectedElement !== null) {
        const text = selectedElement.textContent.trim();
        const url = window.location.href;
        const id = selectedElement.getAttribute("id");
        const timestamp = Date.now();

        capturedElements.push({ text, url, id, timestamp });
        localStorage.setItem("capturedElements", JSON.stringify(capturedElements));

        alert("Element saved successfully!");

        if (!prompt) {
            selectedElement.style.backgroundColor = "";
            selectedElement.style.cursor = "";
            selectedElement = null;
        }

        updatePopup();
    } else {
        alert("No element selected!");
    }
}

function displayCapturedElements() {
    const capturedElementsContainer = document.getElementById(
        "captured-elements-container"
    );
    capturedElementsContainer.style.display = "block";
}

function hideCapturedElements() {
    const capturedElementsContainer = document.getElementById(
        "captured-elements-container"
    );
    capturedElementsContainer.style.display = "none";
}

function clearCapturedElements() {
    capturedElements = [];
    localStorage.removeItem("capturedElements");
    updatePopup();
}

function generateText() {
    const capturedElements = document.querySelectorAll(
        ".captured-element .content"
    );
    const capturedTexts = Array.from(capturedElements).map(
        (element) => element.innerText
    );
    const manualPrompt = manualPromptInput.value.trim(); // use the manualPromptInput variable

    if (capturedElements.length > 0 || manualPrompt !== "") {
        let prompt;
        if (manualPrompt !== "") {
            prompt = manualPrompt;
        } else {
            prompt = prompt("Enter a prompt for the generated text:");
            if (!prompt) {
                return;
            }
        }
        fetch("https://api.openai.com/v1/engines/davinci-codex/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Bearer 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",
            },
            body: JSON.stringify({
                prompt: prompt,
                examples: capturedTexts.map((text) => ({
                    text: text,
                    metadata: window.location.href,
                })),
                max_tokens: 1024,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                // Display the output to the user
                const output = data.choices[0].text.trim();
                alert(output);
                // Save the output to local storage
                const generatedOutputs =
                    JSON.parse(localStorage.getItem("generatedOutputs")) || [];
                generatedOutputs.push({
                    input: prompt,
                    output: output,
                    timestamp: new Date().toLocaleString(),
                });
                localStorage.setItem(
                    "generatedOutputs",
                    JSON.stringify(generatedOutputs)
                );
            })
            .catch((error) => console.error(error));
        alert("Generated text saved successfully!");

        const textContainer = document.createElement("div");
        textContainer.classList.add("generated-text");
        textContainer.innerText = generatedText;
        // append the new element to the content section
        const content = document.querySelector(".content");
        content.appendChild(textContainer);
    } else {
        alert("No captured elements or manual prompt to generate text from!");
    }
}

document
    .getElementById("capture-btn")
    .addEventListener("click", saveCapturedElement);
document
    .getElementById("show-captured-elements-btn")
    .addEventListener("click", displayCapturedElements);
document
    .getElementById("hide-captured-elements-btn")
    .addEventListener("click", hideCapturedElements);
document
    .getElementById("clear-captured-elements-btn")
    .addEventListener("click", clearCapturedElements);
document.getElementById("generate-btn").addEventListener("click", generateText);

// Load captured elements from local storage
const storedElements = localStorage.getItem("capturedElements");
if (storedElements) {
    capturedElements = JSON.parse(storedElements);
    updatePopup();
}
