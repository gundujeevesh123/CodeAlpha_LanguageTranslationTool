
from flask import Flask, request, jsonify, send_from_directory
from deep_translator import GoogleTranslator
from gtts import gTTS
import os
import uuid

app = Flask(__name__, static_folder='.')

LANGUAGES = {
    "auto": "Auto Detect",
    "en": "English",
    "hi": "Hindi",
    "fr": "French",
    "es": "Spanish",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "ja": "Japanese",
    "ko": "Korean",
    "zh-CN": "Chinese",
    "ar": "Arabic"
}

os.makedirs("audio", exist_ok=True)

@app.route("/")
def home():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/audio/<filename>")
def audio_files(filename):
    return send_from_directory("audio", filename)

@app.route("/api/languages")
def get_languages():
    return jsonify({"languages": LANGUAGES})

@app.route("/api/translate", methods=["POST"])
def translate_text():
    try:
        data = request.get_json()

        text = data.get("text", "").strip()
        source = data.get("source", "auto")
        target = data.get("target", "en")

        translated = GoogleTranslator(
            source=source,
            target=target
        ).translate(text)

        return jsonify({
            "translatedText": translated
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/speak", methods=["POST"])
def speak_text():
    try:
        data = request.get_json()

        text = data.get("text", "").strip()
        lang = data.get("lang", "en")

        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join("audio", filename)

        tts = gTTS(text=text, lang=lang)
        tts.save(filepath)

        return jsonify({
            "audioUrl": f"/audio/{filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=8000)
