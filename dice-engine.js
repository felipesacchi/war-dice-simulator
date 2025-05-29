function rollDice(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

function compareDice(attack, defense) {
  const sortedAttack = [...attack].sort((a, b) => b - a);
  const sortedDefense = [...defense].sort((a, b) => b - a);
  
  let attackLosses = 0;
  let defenseLosses = 0;
  
  const minPairs = Math.min(sortedAttack.length, sortedDefense.length);
  
  for (let i = 0; i < minPairs; i++) {
    if (sortedAttack[i] > sortedDefense[i]) {
      defenseLosses++;
    } else {
      attackLosses++;
    }
  }
  
  return { attackLosses, defenseLosses };
}

function getBattleSummary(result) {
  if (result.attackLosses > result.defenseLosses) {
    return "Defesa venceu! Atacante perdeu mais tropas.";
  } else if (result.defenseLosses > result.attackLosses) {
    return "Ataque venceu! Defensor perdeu mais tropas.";
  } else {
    return "Empate! Ambos perderam o mesmo número de tropas.";
  }
}

// Gerar resultados de dados
function rollDice(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}