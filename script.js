// time in ms
const runAnimationTime = 2000;
const attackAnimationTime = 500;
const hurtAnimationTime = 300;
const healAnimationTime = 500;
const deathAnimationTime = 600;
const appearAnimationTime = 2000;
const backgroundMoveAnimationTime = 2000;

// Selected hero
const player = 'swordsman';

// Current enemy
const monster = 'skeleton-swordsman';

// Initial damage values
const playerAttackMinDamage = 3;
const playerAttackMaxDamage = 6;

const playerStrongAttackMinDamage = 7;
const playerStrongAttackMaxDamage = 10;

let monsterAttackMinDamage = getRandomValue(1, 4);
let monsterAttackMaxDamage = getRandomValue(5, 8);

let monsterStrongAttackMinDamage = monsterAttackMaxDamage + 1;
let monsterStrongAttackMaxDamage = monsterAttackMaxDamage + 3;

// Initial heal values
const playerHealMinAmount = 3;
const playerHealMaxAmount = 10;

// Initial health values
let playerHealth = 100;
let monsterHealth = 100;

// Attack counters
let playerAttackCount = 0;
let monsterAttackCount = 0;

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

// Health bars
const $playerHealthBar = document.querySelectorAll('.health__fill')[0];
const $monsterHealthBar = document.querySelectorAll('.health__fill')[1];

// Show container
const $show = document.getElementById('show');
const $player = $show.children[0];
const $monster = $show.children[1];
const $background = $show.children[2];

// Functions to trigger animations
function createAnimation($element, entity, animationClass, duration) {
	return () => {
		return new Promise(resolve => {
			$element.classList.add(`show__${entity}--${animationClass}`);
			setTimeout(() => {
				$element.classList.remove(`show__${entity}--${animationClass}`);
				resolve();
			}, duration);
		});
	};
}

// player
const playerRunAnimation = createAnimation($player, player, 'run', runAnimationTime);
const playerCommonAttackAnimation = createAnimation($player, player, 'common-attack', attackAnimationTime);
const playerStrongAttackAnimation = createAnimation($player, player, 'strong-attack', attackAnimationTime);
const playerHealAnimation = createAnimation($player, player, 'heal', healAnimationTime);
const playerHurtAnimation = createAnimation($player, player, 'hurt', hurtAnimationTime);

function playerDeathAnimation() {
	$player.classList.add(`show__${player}--death`);
}

function removePlayerDeathAnimation() {
	$player.classList.remove(`show__${player}--death`);
}

// monster
const monsterCommonAttackAnimation = createAnimation($monster, monster, 'common-attack', attackAnimationTime);
const monsterStrongAttackAnimation = createAnimation($monster, monster, 'strong-attack', attackAnimationTime);
const monsterHurtAnimation = createAnimation($monster, monster, 'hurt', hurtAnimationTime);
const monsterDeathAnimation = createAnimation($monster, monster, 'death', deathAnimationTime);
const monsterAppearAnimation = createAnimation($monster, monster, 'appear', appearAnimationTime);

// background
const backgroundMoveAnimation = createAnimation($background, 'background', 'move', backgroundMoveAnimationTime);

// chain of responsibility pattern for animations chains
class AnimationChain {
	constructor() {
		this.chain = [];
	}

	add(animationFunction) {
		this.chain.push(animationFunction);
		return this;
	}

	async execute() {
		for (const animationFunction of this.chain) {
			await animationFunction();
		}
	}
}

// animation chains
const playerCommonAttackChain = new AnimationChain().add(playerCommonAttackAnimation).add(monsterHurtAnimation);
const playerStrongAttackChain = new AnimationChain().add(playerStrongAttackAnimation).add(monsterHurtAnimation);
const monsterCommonAttackChain = new AnimationChain().add(monsterCommonAttackAnimation).add(playerHurtAnimation);
const monsterStrongAttackChain = new AnimationChain().add(monsterStrongAttackAnimation).add(playerHurtAnimation);

// functions to call animations chains
async function performPlayerCommonAttackAnimationsChain() {
	await playerCommonAttackChain.execute();
}

async function performPlayerStrongAttackAnimationsChain() {
	await playerStrongAttackChain.execute();
}

async function performMonsterCommonAttackAnimationsChain() {
	await monsterCommonAttackChain.execute();
}

async function performMonsterStrongAttackAnimationsChain() {
	await monsterStrongAttackChain.execute();
}

// Function to generate a random value between min and max
function getRandomValue(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//Function to set monster random damage
function setMonsterDamage() {
	monsterAttackMinDamage = getRandomValue(2, 4);
	monsterAttackMaxDamage = getRandomValue(5, 8);

	monsterStrongAttackMinDamage = monsterAttackMaxDamage + 1;
	monsterStrongAttackMaxDamage = monsterAttackMaxDamage + 3;
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
	if (playerAttackCount >= 3 && healWasPerformed) {
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
	logEvent('MONSTER_APPROACHED', null);
}

// Function to reset game
function resetGame() {
	playerHealth = 100;
	removePlayerDeathAnimation();
	monsterHealth = 100;
	setMonsterDamage();
	playerAttackCount = 0;
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

	const logsObj = {
		monsterHealthDamage: `Damage: ${value}\n Monster health: ${monsterHealth + value} - ${value ? value : 0} --> ${
			monsterHealth >= 0 ? monsterHealth : 0
		}`,
		playerHealthDamage: `Damage: ${value}\n Player health: ${playerHealth + value} - ${value ? value : 0} --> ${
			playerHealth >= 0 ? playerHealth : 0
		}`,
		playerHeal: `Restored: ${value}\n Player health: ${playerHealth - value} + ${
			value ? value : 0
		} --> ${playerHealth}`,
		playerHealth: `Player health: ${playerHealth}`,
		monsterHealth: `Monster health: ${monsterHealth}`
	};

	switch (event) {
		case 'PLAYER_ATTACK':
			logEntry += 'Player attacks\n';
			logEntry += `Action type: Attack\n`;
			logEntry += `${logsObj.monsterHealthDamage}\n`;
			logEntry += `${logsObj.playerHealth}\n`;
			break;
		case 'PLAYER_STRONG_ATTACK':
			logEntry += 'Player attacks\n';
			logEntry += `Action type: Strong attack\n`;
			logEntry += `${logsObj.monsterHealthDamage}\n`;
			logEntry += `${logsObj.playerHealth}\n`;
			break;
		case 'MONSTER_ATTACK':
			logEntry += 'Monster attacks\n';
			logEntry += 'Action type: Attack\n';
			logEntry += `${logsObj.playerHealthDamage}\n`;
			logEntry += `${logsObj.monsterHealth}\n`;
			break;
		case 'MONSTER_STRONG_ATTACK':
			logEntry += 'Monster attacks\n';
			logEntry += 'Action type: Strong attack\n';
			logEntry += `${logsObj.playerHealthDamage}\n`;
			logEntry += `${logsObj.monsterHealth}\n`;
			break;
		case 'PLAYER_HEAL':
			logEntry += `Player heals\n`;
			logEntry += `Action type: Heal\n`;
			logEntry += `${logsObj.playerHeal}\n`;
			logEntry += `${logsObj.monsterHealth}\n`;
			break;
		case 'PLAYER_WIN':
			logEntry += `MONSTER DEFEATED\n`;
			break;
		case 'MONSTER_WIN':
			logEntry += `PLAYER DEFEATED\n`;
			break;
		case 'MONSTER_APPROACHED':
			logEntry += `Another monster approached\n`;
			logEntry += `HP: ${monsterHealth}\n`;
			logEntry += `Monster damage: ${monsterAttackMinDamage} - ${monsterAttackMaxDamage}\n`;
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

async function monsterDeathEvent() {
	monsterHealth = 0;
	logEvent('PLAYER_WIN', null);
	increaseMonsterDefeated();
	await monsterDeathAnimation();
	playerRunAnimation();
	monsterAppearAnimation();
	await backgroundMoveAnimation();
	provideNewEnemy();
}

function playerDeathEvent() {
	playerHealth = 0;
	logEvent('MONSTER_WIN', null);
	playerDeathAnimation();
	setTimeout(() => {
		$newGame.style.display = 'flex';
	}, deathAnimationTime);
}

// Function to perform a common player attack
async function playerCommonAttack() {
	const damage = getRandomValue(playerAttackMinDamage, playerAttackMaxDamage);
	monsterHealth -= damage;
	logEvent('PLAYER_ATTACK', damage);
	playerAttackCount++;

	await performPlayerCommonAttackAnimationsChain();

	if (monsterHealth <= 0) {
		await monsterDeathEvent();
	}

	updateHealthBars();
}

// Function to perform a strong player attack
async function playerStrongAttack() {
	const damage = getRandomValue(playerStrongAttackMinDamage, playerStrongAttackMaxDamage);
	monsterHealth -= damage;
	logEvent('PLAYER_STRONG_ATTACK', damage);
	playerAttackCount = 0;

	await performPlayerStrongAttackAnimationsChain();

	if (monsterHealth <= 0) {
		await monsterDeathEvent();
	}

	updateHealthBars();
}

// Function to perform a player heal
async function playerHeal() {
	const healValue = getRandomValue(playerHealMinAmount, playerHealMaxAmount);
	playerHealth += healValue;
	healWasPerformed = true;

	// (animation not implemented)
	await playerHealAnimation();

	if (playerHealth > 100) {
		playerHealth = 100;
	}

	logEvent('PLAYER_HEAL', healValue);

	updateHealthBars();
}

// Function to perform a monster attack
async function monsterCommonAttack() {
	const damage = getRandomValue(monsterAttackMinDamage, monsterAttackMaxDamage);
	playerHealth -= damage;
	logEvent('MONSTER_ATTACK', damage);

	await performMonsterCommonAttackAnimationsChain();

	if (playerHealth <= 0) {
		playerDeathEvent();
	}

	updateHealthBars();
}

// Function to perform a monster strong attack
async function monsterStrongAttack() {
	const damage = getRandomValue(monsterStrongAttackMinDamage, monsterStrongAttackMaxDamage);
	playerHealth -= damage;
	logEvent('MONSTER_STRONG_ATTACK', damage);

	// temporary (strong attack animation not implemented)
	// await performMonsterStrongAttackAnimationsChain();
	await performMonsterCommonAttackAnimationsChain();

	if (playerHealth <= 0) {
		playerDeathEvent();
	}

	updateHealthBars();
}

// Function to perform a monster attack
async function monsterAttack() {
	if (monsterAttackCount < 5) {
		await monsterCommonAttack();
		monsterAttackCount++;
	} else {
		await monsterStrongAttack();
		monsterAttackCount = 0;
	}
}

// Function to handle button click events
async function buttonClickHandler(event) {
	switch (event.target) {
		case $attackButton:
			disableActionButtons();
			await playerCommonAttack();
			if (monsterHealth !== 100) {
				await monsterAttack();
			}
			if (playerHealth !== 0) {
				enableActionButtons();
			}
			break;
		case $strongAttackButton:
			if (playerAttackCount >= 3 && healWasPerformed) {
				disableActionButtons();
				await playerStrongAttack();
				healWasPerformed = false;
				if (monsterHealth !== 100) {
					await monsterAttack();
				}
				if (playerHealth !== 0) {
					enableActionButtons();
				}
			}
			break;
		case $healButton:
			disableActionButtons();
			await playerHeal();
			await monsterAttack();
			if (playerHealth !== 0) {
				enableActionButtons();
			}
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
