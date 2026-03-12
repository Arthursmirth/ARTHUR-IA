require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const { HfInference } = require('@huggingface/inference');
const qrcode = require('qrcode-terminal');

const hf = new HfInference(process.env.HF_TOKEN);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        // Sur Render, pas besoin de chemin manuel, Puppeteer gère
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    // Le QR Code s'affichera dans les "Logs" de Render
    qrcode.generate(qr, { small: true });
    console.log("Scannez le QR Code ci-dessus dans les logs de Render !");
});

client.on('ready', () => {
    console.log('✅ ARTHUR IA EST EN LIGNE SUR RENDER !');
});

client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        if (!chat.isGroup) {
            const response = await hf.chatCompletion({
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: [
                    { role: "system", content: "Tu es Arthur IA, un assistant intelligent sur WhatsApp." },
                    { role: "user", content: msg.body }
                ],
                max_tokens: 500,
            });

            await msg.reply(response.choices[0].message.content);
        }
    } catch (error) {
        console.error("Erreur IA:", error.message);
    }
});

client.initialize();