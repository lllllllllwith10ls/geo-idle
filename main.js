function get(id) {
	return document.getElementById(id);
}
function getDefaultSave() {
	return {
		points: new Decimal(5),
		pointgen: [
			"empty",
			{
				unlocked: true,
				amount:new Decimal(0),
				bought:new Decimal(0),
        baseCost: 5,
			},
			{
				unlocked: true,
				amount:new Decimal(0),
				bought:new Decimal(0),
        baseCost: 100,
			},
			{
				unlocked: true,
				amount:new Decimal(0),
				bought:new Decimal(0),
        baseCost: 2500,
			}
		],
    dotBoosts: 0,
	}
}

let player = getDefaultSave();

function gameLoop() {
	let newTime = new Date().getTime()
	let diff = (newTime - player.lastTick) / 1000;
	player.lastTick = newTime;
	produce(diff);
	update();
}

function produce(time) {
	player.points = player.pointgen[1].amount.times(time).times(getMult(1)).add(player.points);
  for(let i = 2; i < player.pointgen.length; i++) {
	  player.pointgen[i-1].amount = player.pointgen[i].amount.times(time).times(getMult(i)).add(player.pointgen[i-1].amount);
  }
}

function getMult(dim) {
  return new Decimal(1.01).pow(player.pointgen[dim].bought.times(player.dotBoosts).add(1));
}
function getCost(dim) {
  return new Decimal(1+dim/20).pow(player.pointgen[dim].bought).times(player.pointgen[dim].baseCost);
}
function getDotCost() {
  return new Decimal(1.5).pow(player.dotBoosts).times(150);
}


function update() {
  get("point").innerHTML = format(player.points,true);
  
  
  for(let i = 1; i < player.pointgen.length; i++) {
    get("tier" + i + "Amount").innerHTML = format(player.pointgen[i].amount,true);
    
    get("tier" + i + "Cost").innerHTML = format(getCost(i),true);

    get("buy1Tier" + i).className = canBuyTier(i) ? "pointbtn" : "lockedbtn";

    get("buyMaxTier" + i).className = canBuyTier(i) ? "pointbtn" : "lockedbtn";
    
    get("tier" + i + "Mult").innerHTML = format(getMult(i));
  }
  
  get("dotBoost").className = canBuyDot() ? "pointbtn" : "lockedbtn";

  get("dotBoostCost").innerHTML = format(getDotCost(),true);
  get("dotBoosts").innerHTML = format(player.dotBoosts,true);
}


function canBuyTier(dim) {
  return player.points.gte(getCost(dim));
}


function buyTier(dim) {
  if(canBuyTier(dim)) {
		player.pointgen[dim].amount = player.pointgen[dim].amount.add(1);
		player.points = player.points.sub(getCost(dim));
		player.pointgen[dim].bought = player.pointgen[dim].bought.add(1);
	}
}
function buyMaxTier(dim) {
  while(canBuyTier(dim)) {
    buyTier(dim);
  }
}

function maxAll() {
  for(let i = 1; i < player.pointgen.length; i++) {
    buyMaxTier(i);
  }
}
function canBuyDot() {
  return player.pointgen[3].amount.gte(getDotCost());
}
function dotBoost() {
  if(player.pointgen[3].amount.gte(getDotCost())) {
    player.points = new Decimal(5);
    player.pointgen = getDefaultSave().pointgen;
    player.dotBoosts++;
  }
}

function format(number,int=false) {
	
	if(int && number instanceof Decimal) {
		number = number.floor();
	} else if(int) {
		number = Math.floor(number);
	}
	
	let power;
	let matissa;
	let mag;
	if (number instanceof Decimal) {
		power = number.e;
		matissa = number.mantissa;
		mag = number.mag
		} else {
		matissa = number / Math.pow(10, Math.floor(Math.log10(number)));
		power = Math.floor(Math.log10(number));
		}
	
	if(power < 3) {
		if(int) {
			return (matissa*Math.pow(10,power)).toFixed(0);
		} else {
			return (matissa*Math.pow(10,power)).toFixed(2);
		}
	} if (number.layer === 0 || number.layer === 1) {
		matissa = matissa.toFixed(2);
		return matissa + "e" + power;
	} else {
		if(mag) {
			mag = mag.toFixed(2);
		}
		if (number.layer <= 5) {
			return (number.sign === -1 ? "-" : "") + "e".repeat(number.layer) + mag;
		}
		else {
			return (number.sign === -1 ? "-" : "") + "(e^" + number.layer + ")" + mag;
		}
	}
}

function start() {
	setInterval(gameLoop, 33);
}

function showTab(tab) {
	let tabs = document.getElementsByClassName("tab");
	for(let i = 0; i < tabs.length; i++) {
		tabs[i].style.display = "none";
	}
	get(tab).style.display = "";
	player.tab = tab;
}