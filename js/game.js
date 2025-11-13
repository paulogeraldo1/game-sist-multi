document.addEventListener('DOMContentLoaded', function() {
// ----- ELEMENTOS DO JOGO -----
const gameContainer = document.getElementById('game-container');
const waterDisplay = document.getElementById('resource-display');
const pollutionDisplay = document.getElementById('pollution-display');
const bonusDisplay = document.getElementById('bonus-display');
const pollutionOverlay = document.getElementById('pollution-overlay');
const toolButtons = document.querySelectorAll('.tool-button');

// Feedbacks
const noWaterMsg = document.getElementById('no-water-msg');
const droughtMsg = document.getElementById('drought-msg');

// Metas
const goalElements = {
    planning: document.getElementById('goal-planning'), // NOVO
    sapling: document.getElementById('goal-sapling'),
    tree: document.getElementById('goal-tree'),
    flower: document.getElementById('goal-flower'),
    pollution: document.getElementById('goal-pollution')
};

// Áudio
const audioElements = {
    plant: document.getElementById('plantSound'), waterGain: document.getElementById('waterGainSound'),
    pollution: document.getElementById('pollutionSound'), drought: document.getElementById('droughtSound'),
    win: document.getElementById('winSound'), event: document.getElementById('eventSound')
};

// Cronômetro
const timerDisplay = document.getElementById('timer-display');
const startTime = new Date();
let timerInterval;
let finalTime = "0m 0s";

// Tela de Vitória
const winOverlay = document.getElementById('win-overlay');
const winMessage = document.getElementById('win-message');
const returnButton = document.getElementById('return-button');

//Elementos da Tela de Game Over
const gameoverOverlay = document.getElementById('gameover-overlay');
const gameoverReturnButton = document.getElementById('gameover-return-button');

const awarenessDisplay = document.getElementById('awareness-display'); // 13.3
const planningButton = document.getElementById('planning-button'); // 13.2
const planningMenu = document.getElementById('planning-menu');
const closePlanningButton = document.getElementById('close-planning');
const eventAlert = document.getElementById('event-alert'); // 13.1
const fundButton = document.getElementById('fund-button'); // 13.a

// --- CONFIGURAÇÕES DE VELOCIDADE (em milissegundos) ---
    // (Valores originais: 2000, 3000, 30000)
    // (Para testar rápido, use: 500, 750, 10000)
    const WATER_REGEN_TIME = 500;  // Tempo para ganhar água
    const POLLUTION_TIME = 750;  // Tempo para poluição aumentar
    const EVENT_TIME = 10000; // Tempo entre Desastres Climáticos


// Botões de Upgrade
const upgradeButtons = {
    irrigation: document.getElementById('upgrade-irrigation'),
    walls: document.getElementById('upgrade-walls'),
    capacity: document.getElementById('upgrade-capacity'),
    education: document.getElementById('upgrade-education')
    
};

const treeButton = document.getElementById('tree-button');
const quitGameButton = document.getElementById('quit-game-button');

// NOVO: Elementos Visuais de Infraestrutura
const irrigationVisuals = document.getElementById('irrigation-visual');
const wallsVisuals = document.getElementById('walls-visual');


// ----- CONSTANTES E METAS -----
const goals = { sapling: 15, tree: 10, flower: 10, pollution: 20 };
const POLLUTION_LIMIT = 50;
const BASE_WATER_REGEN = 1;

// ----- ESTADO DO JOGO -----
let currentWater = 15;
let currentPollution = 0;
let currentAwareness = 0; // 13.3
let waterBonus = 0;
let selectedTool = null;
let inventory = { sapling: 0, tree: 0, flower: 0 };
let gameWon = false;
let gameOver = false; //Estado de derrota

// Estado dos Eventos
let isPollutionDrought = false; // Seca por poluição alta

// Estado dos Upgrades (Políticas 13.2)
let upgrades = {
    irrigation: false, // 13.1
    walls: false,      // 13.1
    capacity: false,   // 13.b
    education: false   // 13.3
};

// ----- Loops de Tempo -----

function updateTimer() {
    if (gameWon || gameOver) return; //Checa 'gameOver'
    const now = new Date();
    const timeDiff = (now - startTime) / 1000;
    const minutes = Math.floor(timeDiff / 60);
    const seconds = Math.floor(timeDiff % 60);
    finalTime = `${minutes}m ${seconds}s`;
    timerDisplay.textContent = `Tempo: ${finalTime}`;
}

// Loop de Regeneração de Água
setInterval(function() {
    if (gameWon || gameOver) return; 
    
    isPollutionDrought = (currentPollution >= POLLUTION_LIMIT);
    if (isPollutionDrought) {
        showFeedbackMessage(droughtMsg, 2000);
        playAudio(audioElements.drought);
        return; 
    }
    // 1. Calcula a água base (com bônus das abelhas)
    let waterToAdd = BASE_WATER_REGEN + waterBonus;

    // 2. Verifica se a Irrigação (13.1) está ativa
    if (upgrades.irrigation) {
        waterToAdd *= 2; // Dobra a quantidade!
    }
    currentWater += waterToAdd;
    playAudio(audioElements.waterGain);
    updateUI();
}, WATER_REGEN_TIME);

// Loop de Aumento de Poluição
setInterval(function() {
    if (gameWon || gameOver) return; //Checa 'gameOver'
    
    currentPollution++;
    playAudio(audioElements.pollution);
    updateUI(); // Atualiza a UI

    //Checagem de Game Over
    // Checa se a poluição atingiu o limite E se o jogo já não foi ganho
    if (currentPollution >= POLLUTION_LIMIT && !gameWon) {
        handleGameOver();
    }
}, POLLUTION_TIME);

// Loop de Eventos Climáticos (13.1 / 13.a)
setInterval(function() {
    if (gameWon || gameOver) return; //Checa 'gameOver'
    triggerRandomEvent();
}, EVENT_TIME);

timerInterval = setInterval(updateTimer, 1000);


toolButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        toolButtons.forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        selectedTool = button;
    });
});

// Clique no Chão (Plantar)
gameContainer.addEventListener('click', function(event) {
    if (gameWon || gameOver) return; //Checa 'gameOver'
    
    if (!selectedTool) {
        alert("Por favor, selecione uma ferramenta na barra inferior primeiro!");
        return;
    }

    const plantType = selectedTool.dataset.plant;
    const emoji = selectedTool.dataset.emoji;
    let pollutionReduction = parseInt(selectedTool.dataset.pollRedux);

    // LÓGICA DE CUSTO ---
    let cost = parseInt(selectedTool.dataset.cost); // Mude 'const' para 'let'

    // Aplica o bônus de Capacitação (13.b) se for uma árvore
    if (plantType === 'tree' && upgrades.capacity) {
        cost = 4; // Custo reduzido!
    }

    if (currentWater >= cost) {
        currentWater -= cost;
        inventory[plantType]++;
        
        if (plantType === 'tree' && upgrades.education) {
            pollutionReduction += 1; // Árvore mais eficiente
        }
        
        currentPollution -= pollutionReduction;
        if (currentPollution < 0) currentPollution = 0;

        if (plantType === 'flower') {
            currentAwareness++; 
            if (upgrades.capacity && inventory.flower % 5 === 0) {
                waterBonus++;
            }
        }
        
        createPlant(emoji, event.clientX, event.clientY);
        playAudio(audioElements.plant);
        updateUI();
        checkWinCondition();
        
    } else {
        showFeedbackMessage(noWaterMsg, 1500);
    }
});

returnButton.addEventListener('click', function() {
    window.location.href = 'index.html';
});

planningButton.addEventListener('click', () => {
    if (gameOver) return; //Não abre o menu se o jogo acabou
    planningMenu.style.display = 'flex';
});
closePlanningButton.addEventListener('click', () => {
    planningMenu.style.display = 'none';
});

fundButton.addEventListener('click', () => {
    currentWater += 25;
    fundButton.style.display = 'none';
    showAlert("Fundo Climático (13.a) recebido! +25 💧", true);
    updateUI();
});

// botões de Upgrade
for (const key in upgradeButtons) {
    const button = upgradeButtons[key];
    button.addEventListener('click', () => {
        const cost = parseInt(button.dataset.cost);
        if (upgrades[key]) return; 

        if (currentAwareness >= cost) {
            currentAwareness -= cost;
            upgrades[key] = true;
            button.classList.add('purchased');
            button.textContent = "Implementado!";
            
            if (key === 'irrigation') {
                    if (irrigationVisuals) irrigationVisuals.style.display = 'block';
                }

            if (key === 'walls') {
                    if (wallsVisuals) wallsVisuals.style.display = 'block';
                }

            if (key === 'capacity') {
                updateUI(); // Isso atualiza o bônus de água
                
                // Atualiza o texto do botão da Árvore (usando a const global)
                if (treeButton) {
                    treeButton.textContent = "Plantar Árvore (4💧 / -5💨)";
                    showAlert("Capacitação (13.b) ativada! Custo de Árvores reduzido para 4💧.", true);
                } else {
                    console.error("Botão da Árvore (tree-button) não encontrado!");
                }
                    }
                if (key === 'education') {
                showAlert("Educação (13.3) implementada! Árvores mais eficientes.", true);
                    }
            
            updateUI();
            checkWinCondition();
        } else {
            alert("Pontos de Consciência (💡) insuficientes!");
        }
    });
}

// ----- FUNÇÕES DE EVENTOS (13.1) -----

function triggerRandomEvent() {
    const rand = Math.random();
    
    // --- SECA (13.1) ---
    if (rand < 0.2) { 
        if (upgrades.irrigation) { // Irrigação (13.1) comprada?
            showAlert("Seca evitada pela Irrigação (13.1)!", true);
            return; // Evento prevenido
        }
        
        // Se NÃO tiver Irrigação, o desastre acontece:
        showAlert("ALERTA DE DESASTRE: Seca! (13.1) 50% dos Brotos e Flores perdidos!", false);
        destroyVulnerablePlants(0.5); // Destrói 50%

    // --- ENCHENTE (13.1) ---
    } else if (rand < 0.4) {
        if (upgrades.walls) { // Muros (13.1) comprados?
            showAlert("Enchente não causou danos devido aos Muros (13.1)!", true);
            return; // Evento prevenido
        }

        // Se NÃO tiver Muros, o desastre acontece:
        showAlert("ALERTA DE DESASTRE: Enchente! (13.1) 50% dos Brotos e Flores perdidos!", false);
        destroyVulnerablePlants(0.5); // Destrói 50%

    // --- FUNDO (13.a) ---
    } else if (rand < 0.6) {
        showAlert("Oportunidade: Fundo Climático (13.a) disponível!", true);
        fundButton.style.display = 'block';
        setTimeout(() => {
            fundButton.style.display = 'none';
        }, 10000);
    
    } else {
        // 40% chance de nada
    }
}

function showAlert(message, isPositive) {
    eventAlert.textContent = message;
    eventAlert.className = isPositive ? 'positive' : '';
    eventAlert.style.display = 'block';
    playAudio(audioElements.event);

    setTimeout(() => {
        eventAlert.style.display = 'none';
    }, 5000);
}

/**
 * Destrói uma porcentagem de plantas vulneráveis (Brotos e Flores).
 * @param {number} percentageToDestroy - (0.5 para 50%).
 */
function destroyVulnerablePlants(percentageToDestroy) {
    // 1. Encontrar todas as plantas vulneráveis (Brotos e Flores)
    let allPlants = document.querySelectorAll('.plant');
    let vulnerablePlants = [];
    allPlants.forEach(plant => {
        if (plant.textContent === '🌱' || plant.textContent === '🌸') {
            vulnerablePlants.push(plant);
        }
    });

    // 2. Calcular exatamente a quantidade a destruir
    let totalToDestroy = Math.floor(vulnerablePlants.length * percentageToDestroy);

    // 3. Embaralhar a lista para garantir aleatoriedade justa
    for (let i = vulnerablePlants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [vulnerablePlants[i], vulnerablePlants[j]] = [vulnerablePlants[j], vulnerablePlants[i]];
    }

    // 4. Remover as plantas
    for (let i = 0; i < totalToDestroy; i++) {
        vulnerablePlants[i].remove();
    }
    
    // 5. Recalcular o inventário e atualizar a UI
    recalculateInventory();
}

/**
 * Força uma recontagem de todas as plantas na tela e atualiza o inventário.
 */
function recalculateInventory() {
    inventory.sapling = 0;
    inventory.flower = 0;
    inventory.tree = 0;
    
    let remainingPlants = document.querySelectorAll('.plant');
    remainingPlants.forEach(plant => {
        if (plant.textContent === '🌱') inventory.sapling++;
        else if (plant.textContent === '🌸') inventory.flower++;
        else if (plant.textContent === '🌳') inventory.tree++;
    });
    
    updateUI(); // Força a atualização do painel de metas
}


// ----- AUXILIARES -----
function playAudio(audioElement) {
    audioElement.currentTime = 0;
    audioElement.play().catch(e => {});
}
function createPlant(emoji, x, y) {
    const plant = document.createElement('span');
    plant.className = 'plant';
    plant.textContent = emoji;
    plant.style.fontSize = (Math.random() * 0.5 + 1.8) + 'rem';
    plant.style.left = x + 'px';
    plant.style.top = y + 'px';
    gameContainer.appendChild(plant);
}

function updateUI() {
    if (gameOver) return; 

    waterDisplay.textContent = `${currentWater} 💧`;
    pollutionDisplay.textContent = `${currentPollution} 💨`;
    awarenessDisplay.textContent = `${currentAwareness} 💡`;

// --- FEEDBACK DA UI ---
    
    // 1. Calcula a água base (com bônus das abelhas)
    let waterToAdd = BASE_WATER_REGEN + waterBonus;
    let bonusString = ""; // Texto extra para a UI

    // 2. Checa o bônus de Capacitação (13.b)
    if (upgrades.capacity) {
        bonusString += " 🐝"; // Adiciona o emoji
    }

    // 3. Checa o bônus de Irrigação (13.1)
    if (upgrades.irrigation) {
        waterToAdd *= 2; // Dobra o valor
        bonusString += " (Irrigação x2)";
    }

    // 4. Define o texto final
    bonusDisplay.textContent = `Ganha Água: +${waterToAdd}/2s${bonusString}`;

    // 5. Define a cor (fica cinza se nenhum upgrade estiver ativo)
    if (upgrades.irrigation || upgrades.capacity) {
        bonusDisplay.style.color = "#FFD700"; // Cor de bônus (amarelo)
    } else {
        bonusDisplay.style.color = "#999"; // Cor padrão (cinza)
    }

    //Poluição Visual
    let pollutionOpacity = (currentPollution / 50); 
    pollutionOverlay.style.opacity = Math.min(pollutionOpacity, 0.85);
    const maxBlur = 12;
    const currentBlur = (currentPollution / 50) * maxBlur;
    pollutionOverlay.style.filter = `blur(${currentBlur}px)`; 

    // --- ATUALIZAÇÃO DAS METAS ---
    // 1. Contar políticas compradas (NOVO)
    let policiesPurchased = 0;
    for (const key in upgrades) {
        if (upgrades[key]) {
            policiesPurchased++;
        }
    }

    // 2. Atualizar o texto de TODAS as metas
    goalElements.planning.textContent = `📋 Políticas: ${policiesPurchased} / 4`;
    goalElements.sapling.textContent = `🌱 Brotos: ${inventory.sapling} / ${goals.sapling}`;
    goalElements.tree.textContent = `🌳 Árvores: ${inventory.tree} / ${goals.tree}`;
    goalElements.flower.textContent = `🌸 Flores: ${inventory.flower} / ${goals.flower}`;
    goalElements.pollution.textContent = `💨 Poluição: ${currentPollution} / ${goals.pollution} (Reduzir)`;

    // 3. Atualizar o visual "completed"
    checkGoalCompletion(goalElements.planning, policiesPurchased >= 4);
    checkGoalCompletion(goalElements.sapling, inventory.sapling >= goals.sapling);
    checkGoalCompletion(goalElements.tree, inventory.tree >= goals.tree);
    checkGoalCompletion(goalElements.flower, inventory.flower >= goals.flower);
    checkGoalCompletion(goalElements.pollution, currentPollution <= goals.pollution);
}
function checkGoalCompletion(element, isComplete) {
    if (isComplete) { element.classList.add('completed'); } 
    else { element.classList.remove('completed'); }
}
function showFeedbackMessage(messageElement, duration = 1500) {
    messageElement.style.display = 'block';
    setTimeout(() => { messageElement.style.display = 'none'; }, duration);
}

// -----  Função de Vitória -----
function checkWinCondition() {
    if (gameOver) return;
    // 1. Contar políticas compradas
    let policiesPurchased = 0;
    for (const key in upgrades) {
        if (upgrades[key]) {
            policiesPurchased++;
        }
    }
    // 2. Checar as metas
    let planningGoalMet = (policiesPurchased >= 4);
    let plantGoalsMet = inventory.sapling >= goals.sapling &&
                        inventory.tree >= goals.tree &&
                        inventory.flower >= goals.flower;
    let pollutionGoalMet = (currentPollution <= goals.pollution);

    // 3. Verificar vitória
    if (planningGoalMet && plantGoalsMet && pollutionGoalMet && !gameWon) {
        gameWon = true;
        clearInterval(timerInterval);
        updateTimer();
        document.getElementById('toolbox').style.display = 'none';
        document.getElementById('planning-button').style.display = 'none';
        quitGameButton.style.display = 'none';
        if (planningMenu) planningMenu.style.display = 'none'; // Fecha o menu de planejamento
        pollutionOverlay.style.opacity = 0;
        playAudio(audioElements.win);
        saveScore(); // Salva SÓ na vitória
        winMessage.textContent = `Você venceu em ${finalTime}!`;
        winOverlay.style.display = 'flex';
    }
}

// ----- Função de Game Over -----
function handleGameOver() {
    if (gameWon) return; // Não pode perder se já ganhou

    gameOver = true;
    clearInterval(timerInterval); // Para o relógio e outros loops

    // Esconde a UI do jogo
    document.getElementById('toolbox').style.display = 'none';
    document.getElementById('planning-button').style.display = 'none';
    quitGameButton.style.display = 'none';
    pollutionOverlay.style.opacity = 0; // Remove a poluição visual

    // Para o som de poluição caso esteja tocando
    audioElements.pollution.pause();

    // Toca som de "seca" como um som de falha
    playAudio(audioElements.drought);

    //Mostra a tela de Game Over
    gameoverOverlay.style.display = 'flex';
}

function saveScore() {
    const playerName = sessionStorage.getItem('currentPlayerName') || 'Jogador Anônimo';
    const newScore = { name: playerName, score: finalTime };
    let rankings = JSON.parse(localStorage.getItem('ecosystemRankings')) || [];
    rankings.push(newScore);
    localStorage.setItem('ecosystemRankings', JSON.stringify(rankings));
}

gameoverReturnButton.addEventListener('click', function() {
    window.location.href = 'index.html';
});

quitGameButton.addEventListener('click', function(e) {
    e.stopPropagation();
    // Pergunta ao usuário se ele tem certeza
    const confirmQuit = confirm("Você tem certeza que quer sair? Todo o progresso desta partida será perdido.");
    
    if (confirmQuit) {
        window.location.href = 'index.html';
    }
});
// Chamar updateUI() uma vez no início
updateUI();
});