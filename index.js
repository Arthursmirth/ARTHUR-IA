const puppeteer = require('puppeteer');

async function launchArthur() {
  console.log("Démarrage de l'instance ARTHUR-IA...");
  
  try {
    const browser = await puppeteer.launch({
      // Options obligatoires pour éviter les erreurs sur Render
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--single-process',
        '--no-zygote'
      ],
      // Utilise le chemin d'installation automatique de Puppeteer
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null,
    });

    const page = await browser.newPage();
    await page.goto('https://www.google.com'); // Test de connexion
    
    console.log("✅ ARTHUR-IA est opérationnel sur Render !");
    
    // Insérez la suite de votre code ici (Bot, IA, etc.)

  } catch (error) {
    console.error("❌ Erreur critique au lancement :", error);
    process.exit(1); // Force l'arrêt pour voir l'erreur dans les logs
  }
}

launchArthur();