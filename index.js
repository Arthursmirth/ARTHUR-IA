const { Client, LocalAuth } = require('whatsapp-web.js');
const { HfInference } = require('@huggingface/inference');

// 1. TON TOKEN HUGGING FACE ICI
const HF_TOKEN = 'TON_TOKEN_HF_ICI'; // Remplace par le jeton que tu viens de créer
const hf = new HfInference(HF_TOKEN);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// 2. TON NUMÉRO DE TÉLÉPHONE ICI
client.on('qr', async () => {
    const myNumber = 'TON_NUMERO_ICI'; // Format : indicatif pays + numéro (ex: 225...)
    try {
        const pairingCode = await client.requestPairingCode(myNumber);
        console.log('-------------------------------------------');
        console.log('👉 TON CODE DE JUMELAGE WHATSAPP : ', pairingCode);
        console.log('-------------------------------------------');
    } catch (err) {
        console.error("Erreur de code :", err);
    }
});

client.on('ready', () => {
    console.log('✅ ARTHUR IA (VERSION HUGGING FACE) EST EN LIGNE !');
});

// 3. RÉPONSE AUTOMATIQUE
client.on('message', async (msg) => {
    try {
        const chat = await msg.getChat();
        
        // On ne répond que si ce n'est pas un groupe
        if (!chat.isGroup) {
            
            // On utilise le modèle Llama-3 via Hugging Face
            const response = await hf.chatCompletion({
                model: "meta-llama/Meta-Llama-3-8B-Instruct",
                messages: [
                    { role: "system", content: "Tu es Arthur IA, un assistant intelligent sur WhatsApp." },
                    { role: "user", content: msg.body }
                ],
                max_tokens: 500,
            });

            const replyText = response.choices[0].message.content;
            await msg.reply(replyText);
        }
    } catch (error) {
        console.error("Erreur Hugging Face:", error.message);
        // Optionnel : prévenir l'utilisateur en cas d'erreur
        // await msg.reply("Désolé, mon cerveau a eu un petit bug technique !");
    }
});

client.initialize();