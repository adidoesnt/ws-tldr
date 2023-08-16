require("dotenv").config();
const { Client } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const puppeteer = require("puppeteer");

const client = new Client();
const API_KEY = process.env.MEANINGCLOUD_API_KEY;
const ENDPOINT = "https://api.meaningcloud.com/summarization-1.0";

const main = async () => {
  const browser = await puppeteer.launch();
  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("client is ready");
  });

  client.on("message", async (msg) => {
    if (msg.body === "/tldr") {
      const chat = await msg.getChat();
      const messages = await chat.fetchMessages({ limit: 100 });
      const allMessagesText = messages
        .filter((message) => message.body !== "/tldr")
        .map((message) => message.body)
        .join("\n");
      const title = "summarising last 100 messages...";
      const response = await axios.post(
        ENDPOINT,
        {
          key: API_KEY,
          txt: allMessagesText,
          limit: 20,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      const { summary } = response.data;
      chat.sendMessage(`${title}\n\n${summary}`);
    }
  });

  client.initialize();
};

main();
