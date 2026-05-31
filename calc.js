function fetchData() {
	fetch("data.json")
		.then(response => response.json())
		.then(data => {
			arrayReach = data.viableReach;
			arrayExpansions = data.expansions;
			console.log("Fetch complete!");
			document.getElementById("rollButton").innerHTML = "Roll!";
		})
		.then()
}
fetchData();

function initPool() { // TODO: There must be a less dumb way to do this
	arrayPool = [];
	arrayPool = arrayPool.concat(arrayExpansions.expansionBase);
	if (document.getElementById("expansionRiverfolk").checked) {
		arrayPool = arrayPool.concat(arrayExpansions.expansionRiverfolk);
	}
	if (document.getElementById("expansionUnderworld").checked) {
		arrayPool = arrayPool.concat(arrayExpansions.expansionUnderworld);
	}
	if (document.getElementById("expansionMarauder").checked) {
		arrayPool = arrayPool.concat(arrayExpansions.expansionMarauder);
	}
}

function roll() {
	rollFactions();
	drawFactions();
	rollPlayers();
	drawPlayers();
}

function rollFactions() {
	let successfulRoll = false;
	let rolls = 0;
	while (successfulRoll == false) {
		rolls = rolls + 1;
		initPool();
		let playerCount = document.querySelector("input[type=radio][name=playerCount]:checked").value;
		console.log("players selected: " + playerCount);
		let reachViable = arrayReach[playerCount - 2];
		let reachSum = 0;
		let anotherVagabond = false;
		console.log("players selected: " + playerCount + "; reach needed: " + reachViable);
		arraySelected = [];
	
		// there is an extremely low chance of the eyrie being selected when every low reach faction is in the pool
		// this gives them a better shot by truncating the pool of factions that can never be selected
		if (playerCount == 2) {
			console.log ("we should truncate for 2 players");
			for (let i = (arrayPool.length-1); i > -1; i--) {
				console.log(arrayPool[i].factionName + " has " + arrayPool[i].factionReach + ", we need at least " + (reachViable - 10));
				if (arrayPool[i].factionReach < (reachViable - 10)) {
					console.log("truncating for 2p... goodbye " + arrayPool[i].factionName);
					arrayPool.splice(i, 1);
				}
			}
		}
		
		while (arraySelected.length < playerCount) {
			let rand = Math.floor(Math.random() * arrayPool.length);
			reachSum = reachSum + arrayPool[rand].factionReach;
			console.log("trying " + arrayPool[rand].factionName + ", reachSum = " + reachSum);
			arraySelected.push(Object.assign({}, arrayPool[rand]));
			// after first finding vagabond, this makes all future instances of vagabond reach 2, even in new rolls, FIX
			if (arrayPool[rand].factionName == "Vagabond" && anotherVagabond == true) {
				reachSum = reachSum - 3;
				arrayPool.splice(rand, 1);
				console.log("another vagabond already! -3. reachSum = " + reachSum);
			} else if (arrayPool[rand].factionName == "Vagabond" && anotherVagabond == false) {
				anotherVagabond = true;
			} else {
				arrayPool.splice(rand, 1);
			}
		}

		if (reachSum < reachViable) {
			console.log('Reach too low; retrying...');
		} else {
			successfulRoll = true;
			console.log("we did it in " + rolls + " rolls!");
		}
		
	}
	//if (reachSum < reachViable) { //FIX RECURSION
	//	console.log('Reach too low; retrying...');
	//	rollFactions();
	//} else {
	//	return;
	//}
}

function drawFactions() {
	const area = document.getElementById("selectedFactions");
	area.style.gridTemplateColumns = `repeat(${arraySelected.length}, 1fr)`;
	area.innerHTML = "";

	for(let cursor = 0; cursor < arraySelected.length; cursor++) {
		let card = document.createElement('article');
		card.classList.add(arraySelected[cursor].factionShortname);
		card.style.setProperty("--i", cursor);
		card.style.setProperty("--background", `url(assets/factions/${arraySelected[cursor].factionShortname}/background.png`);
		card.style.setProperty("--accent", arraySelected[cursor].factionColor);
		let cardImage = document.createElement('img');
		cardImage.src = `assets/factions/${arraySelected[cursor].factionShortname}/leader.png`;
		cardImage.setAttribute('aria-hidden', 'true');
		cardImage.alt = "";
		card.appendChild(cardImage);
		let cardTitle = document.createElement('h4');
		cardTitle.textContent = arraySelected[cursor].factionName;
		card.appendChild(cardTitle);
		area.appendChild(card);
	}
}

function rollPlayers() {
	for(let len = arraySelected.length - 1; len > 0; len--) {
		const ind = Math.floor(Math.random() * (len + 1));
		[arraySelected[len], arraySelected[ind]] = [arraySelected[ind], arraySelected[len]];
	}
}

function drawPlayers() {
	const area = document.getElementById("assignedPlayers");
	area.style.gridTemplateColumns = `repeat(${arraySelected.length}, 1fr)`;
	area.innerHTML = "";
	let playerNumber = 0;

	for(let cursor = 0; cursor < arraySelected.length; cursor++) {
		playerNumber++
		let animationDelay = arraySelected.length + playerNumber;
		let player = document.createElement('article');
		player.classList.add(arraySelected[cursor].factionShortname);
		player.style.setProperty("--i", animationDelay);
		player.style.setProperty("--accent", arraySelected[cursor].factionColor);
		let playerLegend = document.createElement('h4');
		playerLegend.textContent = `Player ${playerNumber}`;
		player.appendChild(playerLegend);
		let playerMeeple = document.createElement('img');
		playerMeeple.src = `assets/factions/${arraySelected[cursor].factionShortname}/meeple.png`;
		playerMeeple.alt = arraySelected[cursor].factionName;
		player.appendChild(playerMeeple);
		area.appendChild(player);
	}

}
