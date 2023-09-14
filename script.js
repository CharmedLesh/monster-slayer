// todo: log event - optimaze to object

// Initial damage values
const playerAttackMinDamage = 3;
const playerAttackMaxDamage = 6;

let playerStrongAttackMinDamage = 7;
let playerStrongAttackMaxDamage = 10;

const playerHealMinAmount = 3;
const playerHealMaxAmount = 10;

let monsterAttackMinDamage = getRandomValue(2, 4);
let monsterAttackMaxDamage = getRandomValue(5, 8);

// Initial health values
let playerHealth = 100;
let monsterHealth = 100;

// Attack counter
let attackCount = 0;

// Monster defeated counter
let monsterDefeated = 0;
const $monsterDefeatedCounter = document.querySelector('.game__defeated-monsters-number');

// Heal action boolean
let healWasPerformed = false;

// Log container
const $logContainerWrapper = document.querySelector('#logs').children[0];
const $logContainer = $logContainerWrapper.children[0];

// Action buttons
const $attackButton = document.getElementById('actions__button--attack');
const $strongAttackButton = document.getElementById('actions__button--strong-attack');
const $healButton = document.getElementById('actions__button--heal');

// New game button
const $newGame = document.getElementById('new-game');
const $newGameButton = $newGame.children[0];

// Healt bars
const $playerHealthBar = document.querySelectorAll('.health__fill')[0];
const $monsterHealthBar = document.querySelectorAll('.health__fill')[1];

// Function to generate a random value between min and max
function getRandomValue(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//Function to set monster random damage
function setMonsterDamage() {
	monsterAttackMinDamage = getRandomValue(2, 4);
	monsterAttackMaxDamage = getRandomValue(5, 8);
}

// Function to end the game
function endGame() {
	$newGame.style.display = 'flex';
}

//Function to increase monster defeated counter
function increaseMonsterDefeated() {
	monsterDefeated++;
	$monsterDefeatedCounter.innerText = monsterDefeated;
}

// Function to disable action buttons
function disableActionButtons() {
	$attackButton.disabled = true;
	$strongAttackButton.disabled = true;
	$healButton.disabled = true;
}

// Function to enable action buttons
function enableActionButtons() {
	$attackButton.disabled = false;
	if (attackCount >= 3 && healWasPerformed) {
		$strongAttackButton.disabled = false;
	}
	if (playerHealth !== 100) {
		$healButton.disabled = false;
	}
}

// Function to update health bars
function updateHealthBars() {
	$playerHealthBar.style.width = playerHealth + '%';
	$monsterHealthBar.style.width = monsterHealth + '%';
}

// Function to provide a new enemy
function provideNewEnemy() {
	monsterHealth = 100;
	setMonsterDamage();
	updateHealthBars();
	enableActionButtons();
}

// Function to reset game
function resetGame() {
	playerHealth = 100;
	monsterHealth = 100;
	setMonsterDamage();
	attackCount = 0;
	monsterDefeated = 0;
	$monsterDefeatedCounter.innerText = monsterDefeated;
	healWasPerformed = false;
	$strongAttackButton.disabled = true;
	$healButton.disabled = true;
	$logContainer.innerText = '';
	updateHealthBars();
	$newGame.style.display = 'none';
	enableActionButtons();
}

// Function to log an event
function logEvent(event, value) {
	let logEntry = '';
	let action = '';
	let actionType = '';

	switch (event) {
		case 'PLAYER_ATTACK':
			action = 'Player attacks';
			actionType = 'Attack';

			logEntry += `${action}\n`;
			logEntry += `Action type: ${actionType}\n`;
			logEntry += `Damage: ${value}\n`;
			logEntry += `Monster health: ${monsterHealth + value} - ${value ? value : 0} --> ${
				monsterHealth >= 0 ? monsterHealth : 0
			}\n`;
			logEntry += `Player health: ${playerHealth}\n`;
			break;
		case 'PLAYER_STRONG_ATTACK':
			action = 'Player attacks';
			actionType = 'Strong Attack';

			logEntry += `${action}\n`;
			logEntry += `Action type: ${actionType}\n`;
			logEntry += `Damage: ${value}\n`;
			logEntry += `Monster health: ${monsterHealth + value} - ${value ? value : 0} --> ${
				monsterHealth >= 0 ? monsterHealth : 0
			}\n`;
			logEntry += `Player health: ${playerHealth}\n`;
			break;
		case 'MONSTER_ATTACK':
			action = 'Monster attacks';
			actionType = 'Attack';

			logEntry += `${action}\n`;
			logEntry += `Action type: ${actionType}\n`;
			logEntry += `Damage: ${value}\n`;
			logEntry += `Player health: ${playerHealth + value} - ${value ? value : 0} --> ${
				playerHealth >= 0 ? playerHealth : 0
			}\n`;
			logEntry += `Monster health: ${monsterHealth}\n`;
			break;
		case 'PLAYER_HEAL':
			action = 'Player heals';
			actionType = 'Heal';

			logEntry += `${action}\n`;
			logEntry += `Action type: ${actionType}\n`;
			logEntry += `Restored: ${value} HP\n`;
			logEntry += `Player health: ${playerHealth - value} + ${value ? value : 0} --> ${playerHealth}\n`;
			logEntry += `Monster health: ${monsterHealth}\n`;
			break;
		case 'PLAYER_WIN':
			logEntry += `MONSTER DEFEATED\n`;
			break;
		case 'MONSTER_WIN':
			logEntry += `PLAYER DEFEATED\n`;
			break;
		case 'MONSTER_APPROACHED':
			logEntry += `Another monster approached:\n`;
			logEntry += `HP: 100\n`;
			logEntry += `Damage: ${monsterAttackMinDamage} - ${monsterAttackMaxDamage}\n`;
			break;
		default:
			break;
	}

	if ($logContainer.innerHTML) {
		$logContainer.innerText += '\n' + logEntry;
	} else {
		$logContainer.innerText += logEntry;
	}
	$logContainerWrapper.scrollTop = $logContainer.scrollHeight;
}

// Function to perform a player attack
function playerAttack() {
	const damage = getRandomValue(playerAttackMinDamage, playerAttackMaxDamage);
	monsterHealth -= damage;
	logEvent('PLAYER_ATTACK', damage);
	attackCount++;

	if (attackCount >= 3) {
		$strongAttackButton.disabled = false;
	}

	if (monsterHealth <= 0) {
		monsterHealth = 0;
		logEvent('PLAYER_WIN', null);
		increaseMonsterDefeated();
		provideNewEnemy();
		logEvent('MONSTER_APPROACHED', null);
	}

	updateHealthBars();
}

// Function to perform a strong player attack
function playerStrongAttack() {
	const damage = getRandomValue(playerStrongAttackMinDamage, playerStrongAttackMaxDamage);
	monsterHealth -= damage;
	logEvent('PLAYER_STRONG_ATTACK', damage);
	attackCount = 0;

	if (monsterHealth <= 0) {
		monsterHealth = 0;
		logEvent('PLAYER_WIN', null);
		increaseMonsterDefeated();
		provideNewEnemy();
		logEvent('MONSTER_APPROACHED', null);
	}

	updateHealthBars();
}

// Function to perform a player heal
function playerHeal() {
	const healValue = getRandomValue(playerHealMinAmount, playerHealMaxAmount);
	playerHealth += healValue;
	healWasPerformed = true;

	if (playerHealth > 100) {
		playerHealth = 100;
	}

	logEvent('PLAYER_HEAL', healValue);

	updateHealthBars();
}

// Function to perform a monster attack
function monsterAttack() {
	const damage = getRandomValue(monsterAttackMinDamage, monsterAttackMaxDamage);
	playerHealth -= damage;
	logEvent('MONSTER_ATTACK', damage);

	if (playerHealth <= 0) {
		playerHealth = 0;
		logEvent('MONSTER_WIN', null);
		endGame();
	}

	updateHealthBars();
}

// Function to handle button click events
function buttonClickHandler(event) {
	switch (event.target) {
		case $attackButton:
			playerAttack();
			disableActionButtons();
			setTimeout(() => {
				if (monsterHealth !== 100) {
					monsterAttack();
				}
				if (playerHealth !== 0) {
					enableActionButtons();
				}
			}, 500);
			break;
		case $strongAttackButton:
			if (attackCount >= 3 && healWasPerformed) {
				playerStrongAttack();
				healWasPerformed = false;
				disableActionButtons();
				setTimeout(() => {
					if (monsterHealth !== 100) {
						monsterAttack();
					}
					if (playerHealth !== 0) {
						enableActionButtons();
					}
				}, 500);
			}
			break;
		case $healButton:
			playerHeal();
			disableActionButtons();
			setTimeout(() => {
				monsterAttack();
				enableActionButtons();
			}, 500);
			break;
		case $newGameButton:
			resetGame();
			break;
		default:
			break;
	}
}

// Add event listeners to buttons
$attackButton.addEventListener('click', buttonClickHandler);
$strongAttackButton.addEventListener('click', buttonClickHandler);
$healButton.addEventListener('click', buttonClickHandler);
$newGameButton.addEventListener('click', buttonClickHandler);

// Initialize the game
updateHealthBars();
