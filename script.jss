var board = null;
var game = new Chess();
var $status = $('#status');
var $chat = $('#chat-box');

// 1. Initialisation de l'IA (Le Bot de Guytho)
function makeBotMove() {
    var possibleMoves = game.moves();

    // Si le jeu est fini
    if (possibleMoves.length === 0) return;

    // Intelligence simple : choisit un coup aléatoire mais respecte les règles
    var randomIdx = Math.floor(Math.random() * possibleMoves.length);
    game.move(possibleMoves[randomIdx]);
    board.position(game.fen());
    
    updateStatus();
    addMessage("bot", "Coup analysé. J'ai déplacé ma pièce. À toi.");
}

// 2. Gestion des déplacements par l'utilisateur
function onDragStart (source, piece, position, orientation) {
    // Interdire de bouger les pièces noires ou si la partie est finie
    if (game.game_over()) return false;
    if (piece.search(/^b/) !== -1) return false;
}

function onDrop (source, target) {
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q' 
    });

    // Coup illégal
    if (move === null) return 'snapback';

    updateStatus();
    // Le bot répond après 800ms
    window.setTimeout(makeBotMove, 800);
}

function onSnapEnd () {
    board.position(game.fen());
}

// 3. Mise à jour de l'affichage
function updateStatus () {
    var status = '';
    var moveColor = (game.turn() === 'b') ? 'Noirs' : 'Blancs';

    if (game.in_checkmate()) {
        status = 'MAT ! Victoire des ' + moveColor;
        addMessage("bot", "Échec et Mat. C'est le niveau GUYTHO.");
    } else if (game.in_draw()) {
        status = 'MATCH NUL';
    } else {
        status = 'Trait aux ' + moveColor;
        if (game.in_check()) status += ' (ÉCHEC)';
    }

    $status.html(status);
}

// 4. Système de Chat
function addMessage(sender, text) {
    const type = sender === "bot" ? "msg-bot" : "msg-user";
    const name = sender === "bot" ? "GUYTHO-BOT" : "VOUS";
    
    $chat.append(`
        <div class="flex flex-col ${sender === "bot" ? "items-start" : "items-end"}">
            <span class="text-[10px] text-slate-500 mb-1">${name}</span>
            <div class="${type}">${text}</div>
        </div>
    `);
    $chat.scrollTop($chat[0].scrollHeight);
}

$('#sendBtn').on('click', function() {
    let msg = $('#user-input').val();
    if (msg.trim() !== "") {
        addMessage("user", msg);
        $('#user-input').val('');
        
        // Petite logique de réponse du bot
        setTimeout(() => {
            if(msg.toLowerCase().includes("qui es tu")) addMessage("bot", "Je suis l'intelligence artificielle du Repaire.");
            else addMessage("bot", "Moins de paroles, plus d'échecs.");
        }, 1000);
    }
});

// 5. Lancement
var config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd,
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
};
board = Chessboard('myBoard', config);
updateStatus();

$('#resetBtn').on('click', function() {
    game.reset();
    board.start();
    $chat.empty();
    addMessage("bot", "Nouvelle partie. Concentre-toi.");
    updateStatus();
});
