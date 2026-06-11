
const sourceLanguage = document.querySelector("#sourceLanguage");
const targetLanguage = document.querySelector("#targetLanguage");
const sourceText = document.querySelector("#sourceText");
const translatedText = document.querySelector("#translatedText");
const translateButton = document.querySelector("#translateButton");
const copyButton = document.querySelector("#copyButton");
const speakButton = document.querySelector("#speakButton");
const statusText = document.querySelector("#status");

async function loadLanguages() {
    const response = await fetch("/api/languages");
    const data = await response.json();

    for (const [code, name] of Object.entries(data.languages)) {
        sourceLanguage.append(new Option(name, code));

        if (code !== "auto") {
            targetLanguage.append(new Option(name, code));
        }
    }

    sourceLanguage.value = "auto";
    targetLanguage.value = "hi";
}

async function translate() {

    const text = sourceText.value.trim();

    if (!text) {
        statusText.textContent = "Please enter text.";
        return;
    }

    statusText.textContent = "Translating...";

    try {

        const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                source: sourceLanguage.value,
                target: targetLanguage.value
            })
        });

        const result = await response.json();

        translatedText.textContent = result.translatedText;

        statusText.textContent = "Translation completed.";

    } catch (error) {
        statusText.textContent = "Translation failed.";
    }
}

copyButton.addEventListener("click", () => {

    const text = translatedText.textContent.trim();

    if (!text) return;

    navigator.clipboard.writeText(text);

    statusText.textContent = "Copied successfully.";
});

speakButton.addEventListener("click", async () => {

    const text = translatedText.textContent.trim();

    if (!text) {
        statusText.textContent = "Nothing to speak.";
        return;
    }

    statusText.textContent = "Generating voice...";

    try {

        const response = await fetch("/api/speak", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: text,
                lang: targetLanguage.value
            })
        });

        const result = await response.json();

        const audio = new Audio(result.audioUrl);

        audio.play();

        statusText.textContent = "Voice playing.";

    } catch (error) {

        statusText.textContent = "Voice generation failed.";
    }
});

translateButton.addEventListener("click", translate);

loadLanguages();
