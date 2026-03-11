const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function startArthur() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    
    const client = makeWASocket({
        auth: state,
        printQRInTerminal: false, // On utilise le pairing code à la place
        logger: pino({ level: "silent" })
    });

    // --- CONFIGURATION DU NUMÉRO ---
    let phoneNumber = "225XXXXXXXX"; // METTEZ VOTRE NUMÉRO ICI (format international)

    if (!client.authState.creds.registered) {
        await delay(1500);
        const code = await client.requestPairingCode(phoneNumber);
        console.log(`\n👉 VOTRE CODE DE CONNEXION : ${code}\n`);
    }

    client.ev.on("creds.update", saveCreds);

    client.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        const from = msg.key.remoteJid;

        if (text) {
            console.log(`Message reçu : ${text}`);
            // Appel à ChatGPT
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages:,
            });

            const reply = response.choices[0].message.content;
            await client.sendMessage(from, { text: reply });
        }
    });
}

startArthur();