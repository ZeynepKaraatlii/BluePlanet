//Oyun 1 Kodları
let score = 0;
let draggedItem = null;

function refreshScore() {
  document.getElementById('score').textContent = score;
}

function randomPosition(item, container) {
  const contWidth = container.clientWidth;
  const contHeight = container.clientHeight;
  const itemWidth = item.offsetWidth;
  const itemHeight = item.offsetHeight;

  const maxLeft = contWidth - itemWidth;
  const maxTop = contHeight - itemHeight;

  const left = Math.floor(Math.random() * maxLeft);
  const top = Math.floor(Math.random() * maxTop);

  item.style.left = left + 'px';
  item.style.top = top + 'px';
}

window.onload = () => {
  const itemsContainer = document.querySelector('.items');
  const items = document.querySelectorAll('.items .item');
  items.forEach(item => {
    randomPosition(item, itemsContainer);
    item.addEventListener('dragstart', dragStart);
  });
  refreshScore(); // Başlangıçta puanı göster
};

function dragStart(e) {
  draggedItem = e.target;
}

function allowDrop(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const acceptedType = e.currentTarget.dataset.accept;
  const itemType = draggedItem.dataset.type;

  if (itemType === acceptedType) {
    e.currentTarget.appendChild(draggedItem);
    randomPosition(draggedItem, e.currentTarget);
    score += 10;
    refreshScore();
  } else {
    alert("Yanlış kutu!");
  }

  checkGameEndTrash();
}

function checkGameEndTrash() {
  const itemsLeft = document.querySelectorAll('.items .item').length;
  if (itemsLeft === 0) {
    const celebrationDiv = document.getElementById('celebration');
    celebrationDiv.style.display = 'block';

    setTimeout(() => {
      celebrationDiv.style.display = 'none';
    }, 3000);
  }
}


const gameArea = document.getElementById('gameArea');
const shovel = document.getElementById('shovel');
const saplingIcon = document.getElementById('saplingIcon');
const wateringCan = document.getElementById('wateringCan');

let offsetX = 0;
let offsetY = 0;
let dugSpots = [];
let plantedSaplings = []; // sulanmayı bekleyen fidanlar

shovel.addEventListener('dragstart', (e) => {
  const rect = shovel.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;
  e.dataTransfer.setData('text/plain', 'shovel');
});

saplingIcon.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', 'sapling');
});

wateringCan.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', 'wateringcan');
});

gameArea.addEventListener('dragover', (e) => {
  e.preventDefault();
});

gameArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const rect = gameArea.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const droppedTool = e.dataTransfer.getData('text/plain');

  const groundHeight = 100;
  const groundTop = gameArea.clientHeight - groundHeight;
  const allowedYStart = groundTop + groundHeight / 2;

  if (droppedTool === 'shovel') {
    if (y >= allowedYStart) {
      digAt(x, y);
    } else {
      alert("Toprağın üst yarısına kazma yapamazsın!");
    }
  }

  if (droppedTool === 'sapling') {
    if (y >= allowedYStart) {
      if (isNearDugSpot(x, y)) {
        plantTree(x, y);
      } else {
        alert("Önce toprağı kazmalısın!");
      }
    } else {
      alert("Fidanı toprağın alt yarısına dikmelisin!");
    }
  }

  if (droppedTool === 'wateringcan') {
    const sapling = findNearestUnwateredSapling(x, y);
    if (sapling) {
      sapling.watered = true;
      showWaterEffect(x, y);

      setTimeout(() => {
        sapling.element.remove();

        const tree = document.createElement('img');
        tree.src = '/cocuklar-özel/cocuklar_assets/tree.png';
        tree.className = 'element';
        tree.style.left = `${sapling.x - 25}px`;
        tree.style.top = `${sapling.y - 30}px`;
        tree.style.transformOrigin = 'bottom center';
        tree.style.transform = 'scale(0)';
        gameArea.appendChild(tree);

        setTimeout(() => {
          tree.style.transform = 'scale(10)';
        }, 50);
      }, 1000);
    } else {
      alert("Yakında sulanacak bir fidan yok!");
    }
  }
});

function digAt(x, y) {
  const dug = document.createElement('img');
  dug.src = '/cocuklar-özel/cocuklar_assets/soil.png';
  dug.className = 'element';
  dug.style.left = `${x - 25}px`;
  dug.style.top = `${y - 25}px`;
  gameArea.appendChild(dug);

  dugSpots.push({ x, y });
}

function plantTree(x, y) {
  const groundHeight = 100;
  const groundTop = gameArea.clientHeight - groundHeight;
  const allowedYStart = groundTop + groundHeight / 2;

  if (y < allowedYStart) {
    alert("Fidanı toprağın alt yarısına dikmelisin!");
    return;
  }

  const sapling = document.createElement('img');
  sapling.src = '/cocuklar-özel/cocuklar_assets/sapling.png';
  sapling.className = 'element';
  sapling.style.left = `${x - 25}px`;
  sapling.style.top = `${y - 60}px`;
  sapling.style.transformOrigin = 'bottom center';
  sapling.style.transform = 'scaleY(1)';
  gameArea.appendChild(sapling);

  plantedSaplings.push({ x, y, element: sapling, watered: false });

  const soils = [...gameArea.querySelectorAll('img')].filter(img => img.src.includes('soil.png'));

  let closestSoil = null;
  let minDist = Infinity;
  soils.forEach(soil => {
    const soilX = parseFloat(soil.style.left);
    const soilY = parseFloat(soil.style.top);
    const dx = soilX + 25 - x;
    const dy = soilY + 25 - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDist) {
      minDist = dist;
      closestSoil = soil;
    }
  });

  if (closestSoil) {
    setTimeout(() => {
      closestSoil.remove();
    }, 1000);
  }
}

function isNearDugSpot(x, y) {
  return dugSpots.some(spot => {
    const dx = spot.x - x;
    const dy = spot.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 40;
  });
}

function findNearestUnwateredSapling(x, y) {
  return plantedSaplings.find(sap => {
    const dx = sap.x - x;
    const dy = sap.y - y;
    return !sap.watered && Math.sqrt(dx * dx + dy * dy) < 40;
  });
}

function showWaterEffect(x, y) {
  const pouringCan = document.createElement('img');
  pouringCan.src = '/cocuklar-özel/cocuklar_assets/watering-can-pour.png';
  pouringCan.className = 'element';
  pouringCan.style.left = `${x - 30}px`;
  pouringCan.style.top = `${y - 80}px`;
  pouringCan.style.width = '60px';
  pouringCan.style.transform = 'rotate(-20deg)';
  pouringCan.style.opacity = '0.9';

  gameArea.appendChild(pouringCan);

  setTimeout(() => pouringCan.remove(), 700);
}
//Üçüncü Oyun Kodları
let scoreWaterGame = 0;
let timeLeft = 30;
let gameInterval;
let faucetInterval;

function updateScore() {
  document.getElementById('scoreWaterGame').textContent = scoreWaterGame;
}

function updateTimer() {
  document.getElementById('timeLeft').textContent = timeLeft;
}

function checkGameEndFaucet() {
  const celebrationDiv = document.getElementById('celebration2');
  celebrationDiv.innerHTML = `
    <div style="font-size: 24px; color: green; margin-bottom: 10px;">
      🎉 Tebrikler! <strong>${scoreWaterGame}</strong> musluk kapatarak su israfını engelledin!
    </div>
    <img src="/cocuklar-özel/cocuklar_assets/Animation - 1751538769034.gif" alt="Kutlama!" width="200" />
  `;
  celebrationDiv.style.display = 'block';

  setTimeout(() => {
    celebrationDiv.style.display = 'none';
  }, 4000);
}

function randomlyOpenFaucet() {
  const faucets = document.querySelectorAll('.faucet');
  const closedFaucets = Array.from(faucets).filter(f => f.classList.contains('closed'));

  if (closedFaucets.length === 0) return;

  const randomFaucet = closedFaucets[Math.floor(Math.random() * closedFaucets.length)];
  randomFaucet.classList.remove('closed');
}

function startGame() {
  // Oyun başlarken puan ve süre sıfırlanmalı
  scoreWaterGame = 0;
  timeLeft = 30;
  updateScore();
  updateTimer();

  const faucets = document.querySelectorAll('.faucet');

  // Önce eski event listener'ları kaldır (tekrar başlamalarda sorun olmasın)
  faucets.forEach(faucet => {
    faucet.replaceWith(faucet.cloneNode(true));
  });

  // Yeni muslukları seç (klonlandıkları için)
  const newFaucets = document.querySelectorAll('.faucet');

  newFaucets.forEach(faucet => {
    faucet.classList.add('closed'); // Başlangıçta kapalı olsun

    faucet.addEventListener('click', () => {
      if (!faucet.classList.contains('closed') && timeLeft > 0) {
        faucet.classList.add('closed');
        scoreWaterGame += 1;
        updateScore();
      }
    });
  });

  // Süreyi ve muslukları açmayı başlat
  faucetInterval = setInterval(() => {
    if (timeLeft > 0) {
      randomlyOpenFaucet();
    }
  }, 1500);

  gameInterval = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft === 0) {
      clearInterval(gameInterval);
      clearInterval(faucetInterval);

      newFaucets.forEach(f => f.classList.add('closed'));

      checkGameEndFaucet();
    }
  }, 1000);
}

// Başla butonuna tıklanınca oyunu başlat
document.getElementById('startButton').addEventListener('click', startGame);


  

