// Elementos da interface
const homeScreen = document.getElementById('homeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameContent = document.querySelector('.game-content');
const themeToggle = document.getElementById('themeToggle');

// Variáveis de estado
let battleHistory = [];
let currentMode = 'war-classic'; // Modo padrão

// Eventos
document.addEventListener('click', function(e) {
  // Navegação entre telas
  if (e.target.closest('.game-card')) {
    currentMode = e.target.closest('.game-card').dataset.game;
    homeScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    renderBattleInterface();
    return;
  }
  
  // Botão Voltar
  if (e.target.closest('#backButton')) {
    gameScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    return;
  }
  
  // Botão Nova Batalha
  if (e.target.closest('#newBattleBtn')) {
    renderBattleInterface();
    return;
  }
  
  // Botão Simular Batalha
  if (e.target.closest('#simulateBtn')) {
    if (currentMode === 'war-classic') {
      simulateClassicBattle();
    } else if (currentMode === 'war-lotr') {
      simulateLOTRBattle();
    }
    return;
  }
});

// Alternar tema claro/escuro
themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  themeToggle.textContent = newTheme === 'dark' ? '🌙' : '☀️';
});

// Renderiza a interface de batalha conforme o modo
function renderBattleInterface() {
  const isLOTR = currentMode === 'war-lotr';
  const gameTitle = isLOTR ? "WAR: O Senhor dos Anéis" : "WAR Clássico";
  
  document.getElementById('gameTitle').textContent = `⚔️ ${gameTitle}`;
  
  gameContent.innerHTML = `
    <div class="troops-controls">
      <div class="troops-set attack">
        <h2>Tropas de Ataque</h2>
        <div class="input-group">
          <label for="attackTroops">Quantidade de Tropas:</label>
          <input type="number" min="2" value="10" id="attackTroops">
          <p class="info">Mínimo: 2 tropas</p>
          
          <div class="battle-option">
            <input type="checkbox" id="allInCheckbox">
            <label for="allInCheckbox">Ataque All-in (usar todas as tropas)</label>
          </div>
          
          ${isLOTR ? `
            <div class="battle-option">
              <input type="checkbox" id="attackLeaderCheckbox">
              <label for="attackLeaderCheckbox">Líder (+1 ao maior dado)</label>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="troops-set defense">
        <h2>Tropas de Defesa</h2>
        <div class="input-group">
          <label for="defenseTroops">Quantidade de Tropas:</label>
          <input type="number" min="1" value="5" id="defenseTroops">
          <p class="info">Mínimo: 1 tropa</p>
          
          ${isLOTR ? `
            <div class="battle-option">
              <input type="checkbox" id="defenseLeaderCheckbox">
              <label for="defenseLeaderCheckbox">Líder (+1 ao maior dado)</label>
            </div>
            <div class="battle-option">
              <input type="checkbox" id="fortressCheckbox">
              <label for="fortressCheckbox">Fortaleza (+1 ao maior dado)</label>
            </div>
          ` : ''}
        </div>
      </div>
      
      <div class="simulate-button-container">
        <button id="simulateBtn" class="btn primary">⚔️ Simular Batalha</button>
      </div>
    </div>
    
    <div class="battle-report" id="battleReport">
      <div class="battle-result hidden" id="battleResult"></div>
      <div class="round-report" id="roundReport"></div>
      <div class="history-panel" id="historyPanel"></div>
    </div>
  `;
}

// Função comum para ambos os modos
function simulateBattleBase(allIn, attackLeader, defenseLeader, fortress) {
  let attackTroops = parseInt(document.getElementById('attackTroops').value) || 10;
  let defenseTroops = parseInt(document.getElementById('defenseTroops').value) || 5;
  
  if (attackTroops < 2) {
    alert("O ataque precisa de pelo menos 2 tropas!");
    return null;
  }
  
  if (defenseTroops < 1) {
    alert("A defesa precisa de pelo menos 1 tropa!");
    return null;
  }
  
  // Objeto para armazenar a batalha
  const battle = {
    round: 1,
    attackTroops,
    defenseTroops,
    initialAttack: attackTroops,
    initialDefense: defenseTroops,
    attackLossesTotal: 0,
    defenseLossesTotal: 0,
    rounds: [],
    allIn: allIn,
    mode: currentMode,
    attackLeader: attackLeader,
    defenseLeader: defenseLeader,
    fortress: fortress
  };
  
  // Simular todas as rodadas
  while (
    (allIn ? attackTroops > 0 : attackTroops > 1) && 
    defenseTroops > 0
  ) {
    // Determinar número de dados para esta rodada
    const attackDice = allIn ? 
      Math.min(3, attackTroops) : 
      Math.min(3, attackTroops - 1);
      
    const defenseDice = Math.min(3, defenseTroops);
    
    // Se não há dados suficientes para continuar
    if (attackDice === 0) break;
    
    // Rolar dados
    let attackRolls = rollDice(attackDice).sort((a, b) => b - a);
    let defenseRolls = rollDice(defenseDice).sort((a, b) => b - a);
    
    // Aplicar bônus do Líder e Fortaleza (apenas para LOTR)
    if (currentMode === 'war-lotr') {
      if (attackLeader && attackRolls.length > 0) {
        attackRolls[0] += 1;
      }
      
      if (defenseLeader && defenseRolls.length > 0) {
        defenseRolls[0] += 1;
      }
      
      if (fortress && defenseRolls.length > 0) {
        defenseRolls[0] += 1;
      }
    }
    
    // Comparar resultados
    const minPairs = Math.min(attackRolls.length, defenseRolls.length);
    let attackLosses = 0;
    let defenseLosses = 0;
    let comparisonDetails = [];
    
    for (let i = 0; i < minPairs; i++) {
      if (attackRolls[i] > defenseRolls[i]) {
        defenseLosses++;
        comparisonDetails.push(`${attackRolls[i]} > ${defenseRolls[i]} (Ataque)`);
      } else {
        attackLosses++;
        comparisonDetails.push(`${attackRolls[i]} <= ${defenseRolls[i]} (Defesa)`);
      }
    }
    
    // Atualizar tropas
    attackTroops -= attackLosses;
    defenseTroops -= defenseLosses;
    
    // Garantir valores mínimos
    attackTroops = Math.max(0, attackTroops);
    defenseTroops = Math.max(0, defenseTroops);
    
    // Atualizar totais
    battle.attackLossesTotal += attackLosses;
    battle.defenseLossesTotal += defenseLosses;
    
    // Registrar rodada
    battle.rounds.push({
      number: battle.round,
      attackRolls,
      defenseRolls,
      attackLosses,
      defenseLosses,
      attackTroops,
      defenseTroops,
      comparison: comparisonDetails
    });
    
    battle.round++;
  }
  
  // Determinar resultado final
  battle.finalAttack = attackTroops;
  battle.finalDefense = defenseTroops;
  
  if (defenseTroops <= 0) {
    battle.result = `🏆 ATAQUE VENCEU! Território conquistado com ${attackTroops} tropas restantes.`;
  } else if (attackTroops <= (allIn ? 0 : 1)) {
    battle.result = `🛡️ DEFESA VENCEU! Ataque repelido com ${defenseTroops} tropas restantes.`;
  } else {
    battle.result = "⚖️ BATALHA INTERROMPIDA! Nenhum lado venceu completamente.";
  }
  
  return battle;
}

// Simulação para modo clássico
function simulateClassicBattle() {
  const allIn = document.getElementById('allInCheckbox').checked;
  const battle = simulateBattleBase(allIn, false, false, false);
  
  if (battle) {
    renderBattleResult(battle);
    addToHistory(battle);
    renderHistory();
  }
}

// Simulação para modo LOTR
function simulateLOTRBattle() {
  const allIn = document.getElementById('allInCheckbox').checked;
  const attackLeader = document.getElementById('attackLeaderCheckbox').checked;
  const defenseLeader = document.getElementById('defenseLeaderCheckbox').checked;
  const fortress = document.getElementById('fortressCheckbox').checked;
  
  const battle = simulateBattleBase(allIn, attackLeader, defenseLeader, fortress);
  
  if (battle) {
    renderBattleResult(battle);
    addToHistory(battle);
    renderHistory();
  }
}

// Exibe o resultado da batalha e as rodadas
function renderBattleResult(battle) {
  const battleResult = document.getElementById('battleResult');
  battleResult.classList.remove('hidden');
  
  const isLOTR = battle.mode === 'war-lotr';
  
  // Em renderBattleResult
battleResult.innerHTML = `
  <div class="final-result">
    <h3>Resultado Final</h3>
    <p class="${battle.result.includes('ATAQUE') ? 'victory' : 
               battle.result.includes('DEFESA') ? 'defeat' : 'draw'}">
      ${battle.result}
    </p>
    <div class="result-stats">
      <div class="stat">
        <span>Ataque</span>
        <span class="stat-value">${battle.initialAttack} → ${battle.finalAttack}</span>
      </div>
      <div class="vs">VS</div>
      <div class="stat">
        <span>Defesa</span>
        <span class="stat-value">${battle.initialDefense} → ${battle.finalDefense}</span>
      </div>
    </div>
    <p>Total de rodadas: ${battle.rounds.length}</p>
    <p>Perdas totais: 
      <span class="loss attack">Ataque: ${battle.attackLossesTotal}</span> | 
      <span class="loss defense">Defesa: ${battle.defenseLossesTotal}</span>
    </p>
    ${battle.allIn ? '<div class="status-tag all-in-tag">⚡ Ataque All-in ativado</div>' : ''}
    ${isLOTR && battle.attackLeader ? '<div class="status-tag lotr-tag">👑 Líder de Ataque ativado</div>' : ''}
    ${isLOTR && battle.defenseLeader ? '<div class="status-tag lotr-tag">👑 Líder de Defesa ativado</div>' : ''}
    ${isLOTR && battle.fortress ? '<div class="status-tag lotr-tag">🏰 Fortaleza ativada</div>' : ''}
  </div>
`;
  
  // Exibir rodadas
  const roundReport = document.getElementById('roundReport');
  roundReport.innerHTML = '<h3>Detalhes das Rodadas</h3>';
  
  battle.rounds.forEach(round => {
    roundReport.innerHTML += `
      <div class="round">
        <h4>Rodada ${round.number}</h4>
        ${isLOTR && battle.attackLeader ? '<p class="lotr-info">👑 Líder de Ataque: +1 no maior dado</p>' : ''}
        ${isLOTR && battle.defenseLeader ? '<p class="lotr-info">👑 Líder de Defesa: +1 no maior dado</p>' : ''}
        ${isLOTR && battle.fortress ? '<p class="lotr-info">🏰 Fortaleza: +1 no maior dado</p>' : ''}
        <div class="round-content">
          <div class="dice-comparison">
            <div class="dice-group attack">
              <span class="dice-label">Ataque (${round.attackRolls.length} dados):</span>
              <div class="dice-set">
                ${round.attackRolls.map((val, index) => 
                  `<div class="die red ${isLOTR && battle.attackLeader && index === 0 ? 'leader' : ''}">${val}</div>`
                ).join('')}
              </div>
            </div>
            <div class="vs-icon">⚔️</div>
            <div class="dice-group defense">
              <span class="dice-label">Defesa (${round.defenseRolls.length} dados):</span>
              <div class="dice-set">
                ${round.defenseRolls.map((val, index) => 
                  `<div class="die black ${isLOTR && (battle.defenseLeader || battle.fortress) && index === 0 ? 'leader' : ''}">${val}</div>`
                ).join('')}
              </div>
            </div>
          </div>
          <div class="round-details">
            <p><strong>Perdas:</strong> 
              <span class="loss attack">Ataque: ${round.attackLosses}</span>, 
              <span class="loss defense">Defesa: ${round.defenseLosses}</span>
            </p>
            <p><strong>Tropas restantes:</strong> 
              <span class="troops attack">Ataque: ${round.attackTroops}</span>, 
              <span class="troops defense">Defesa: ${round.defenseTroops}</span>
            </p>
          </div>
        </div>
      </div>
    `;
  });
}

// Adicionar ao histórico
function addToHistory(battle) {
  battleHistory.unshift({
    mode: battle.mode,
    initialAttack: battle.initialAttack,
    initialDefense: battle.initialDefense,
    finalAttack: battle.finalAttack,
    finalDefense: battle.finalDefense,
    rounds: battle.rounds.length,
    result: battle.result,
    date: new Date().toLocaleString(),
    allIn: battle.allIn,
    attackLeader: battle.attackLeader,
    defenseLeader: battle.defenseLeader,
    fortress: battle.fortress
  });
  
  // Manter apenas os últimos 10 históricos
  if (battleHistory.length > 10) {
    battleHistory.pop();
  }
}

// Renderizar histórico
function renderHistory() {
  const historyPanel = document.getElementById('historyPanel');
  historyPanel.innerHTML = '<h3>Histórico de Batalhas</h3>';
  
  if (battleHistory.length === 0) {
    historyPanel.innerHTML += '<p>Nenhuma batalha registrada ainda</p>';
    return;
  }
  
  historyPanel.innerHTML += '<ul class="history-list">';
  
  battleHistory.forEach((battle, index) => {
    const resultClass = battle.result.includes('ATAQUE') ? 'victory' : 
                       battle.result.includes('DEFESA') ? 'defeat' : 'draw';
    
    historyPanel.innerHTML += `
      <li class="history-item">
        <div class="history-header">
          <span>Batalha ${index + 1}</span>
          <small>${battle.date}</small>
        </div>
        <div class="history-stats">
          <span class="attack">${battle.initialAttack}⚔️ → ${battle.finalAttack}</span>
          <span> vs </span>
          <span class="defense">${battle.initialDefense}🛡️ → ${battle.finalDefense}</span>
        </div>
        <div class="history-mode">Modo: ${battle.mode === 'war-classic' ? 'Clássico' : 'Senhor dos Anéis'}</div>
        ${battle.allIn ? '<div class="status-tag all-in-tag">⚡ All-in</div>' : ''}
        ${battle.mode === 'war-lotr' && battle.attackLeader ? '<div class="status-tag lotr-tag">👑 Ataque</div>' : ''}
        ${battle.mode === 'war-lotr' && battle.defenseLeader ? '<div class="status-tag lotr-tag">👑 Defesa</div>' : ''}
        ${battle.mode === 'war-lotr' && battle.fortress ? '<div class="status-tag lotr-tag">🏰 Fortaleza</div>' : ''}
        <div class="history-result ${resultClass}">${battle.result.replace('!', '').replace('.', '')}</div>
        <div class="history-rounds">Rodadas: ${battle.rounds}</div>
      </li>
    `;
  });
  
  historyPanel.innerHTML += '</ul>';
}

// Inicialização
function init() {
  // Garantir que o tema está aplicado
  document.documentElement.setAttribute('data-theme', 'dark');
  
  // Eventos para os cards de jogo
  document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      homeScreen.classList.add('hidden');
      gameScreen.classList.remove('hidden');
      renderBattleInterface();
    });
  });
}

// Iniciar o app
init();