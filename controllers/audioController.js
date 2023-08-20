const dotenv = require("dotenv").config();
const axios = require("axios");
const FormData = require("form-data");
const { Configuration, OpenAIApi } = require("openai");
const { Readable } = require("stream");

const OPEN_API_KEY = process.env.OPEN_API_KEY;

// Configure the OpenAI API client with the API key
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports.createTranslation = async (req, res, next) => {
  try {
    const model = "whisper-1";
    const audioFile = req.file;
    const translateLanguage = req.body.language;
    const formData = new FormData();
    formData.append("model", model);
    formData.append("file", Readable.from(audioFile.buffer), {
      filename: "audio.mp3",
      contentType: audioFile.mimetype,
    });
    if (translateLanguage !== "None") {
      axios
        .post("https://api.openai.com/v1/audio/translations", formData, {
          headers: {
            Authorization: `Bearer ${OPEN_API_KEY}`,
            "Content-type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          },
        })
        .then((response) => {
          const text = response.data.text;
          const language = translateLanguage;
          openai
            .createCompletion({
              model: "text-davinci-003",
              prompt: `Translate '${text}' from English to ${language}`,
              temperature: 0,
              max_tokens: 200,
              top_p: 1,
              frequency_penalty: 0,
              presence_penalty: 0,
            })
            .then((response) => {
              // Extract the translated text from the API response
              const translatedText = response.data.choices[0].text;
              return res.json({ msg: translatedText });
            });
        })
        .catch(() => {
          process.exit();
        });
    } else {
      axios
        .post("https://api.openai.com/v1/audio/transcriptions", formData, {
          headers: {
            Authorization: `Bearer ${OPEN_API_KEY}`,
            "Content-type": `multipart/form-data; boundary=${formData.getBoundary()}`,
          },
        })
        .then((response) => {
          const text = response.data.text;
          return res.json({ msg: text });
        })
        .catch(() => {
          process.exit();
        });
    }
  } catch (ex) {}
};
