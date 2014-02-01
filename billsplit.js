$(document).ready(function() {
	$('#addpayer').click(function(){
		$('#payers').append(
			'<tr class="payer"><td><input type="text" name="name" placeholder="John"></td><td><input type="number" name="dollar1" placeholder="0" min="0" step="1"></td><td><input type="number" name="dollar5" placeholder="0" min="0" step="1"></td><td><input type="number" name="dollar10" placeholder="0" min="0" step="1"></td><td><input type="number" name="dollar20" placeholder="0" min="0" step="1"></td><td><input type="number" name="order" placeholder="0" min="0" step="0.01"></td><td><input id="removepayer" type="button" value="-"></td></tr>');
	});

	$(document).on('click', '#removepayer', function (e) {
		e.preventDefault();
		$(this).parents('.payer').remove();
	});

	$('form').submit(function() {
		construct();
		distribute();
		display();
		return false;
	});

});

function Bill(owner, cents) {
	this.owner = owner;
	this.cents = cents;
}

var cash;
var payers;
var wallets;
var walletsizes;
var orders;
var moneyleft;

var multiplier;
var subtotal;
var total;
var tip;
var totalwithtip;

function construct() {
	var $payers = $('#payers tr.payer');

	cash = new Array();
	wallets = new Array();
	wallets.length = $payers.length;
	payers = new Array();
	payers.length = $payers.length;
	orders = new Array();
	orders.length = $payers.length;
	charges = new Array();
	charges.length = $payers.length;
	walletsizes = new Array();
	walletsizes.length = $payers.length;

	subtotal = 0;
	$payers.each(function(index) {
		var name = $(this).find('input[name="name"]').val();
		payers[index] = name;

		var total = 0;

		var dollar1 = $(this).find('input[name="dollar1"]').val();
		for (var i=0; i<dollar1; i++) {
			cash.push(new Bill(name, 100));
			total += 100;
		}

		var dollar5 = $(this).find('input[name="dollar5"]').val();
		for (var i=0; i<dollar5; i++) {
			cash.push (new Bill(name, 500));
			total += 500;
		}

		var dollar10 = $(this).find('input[name="dollar10"]').val();
		for (var i=0; i<dollar10; i++) {
			cash.push (new Bill(name, 1000));
			total += 1000;
		}

		var dollar20 = $(this).find('input[name="dollar20"]').val();
		for (var i=0; i<dollar20; i++) {
			cash.push (new Bill(name, 2000));
			total += 2000;
		}

		var order = parseInt($(this).find('input[name="order"]').val());
		orders[index] = Math.ceil(order * 100);
		subtotal += orders[index];

		wallets[index] = [];
		walletsizes[index] = total;
	});

	total = parseInt($('form').find('input[name="total"]').val());
	total = Math.ceil(total * 100);

	tip = parseInt($('form').find('input[name="tip"]').val());
	totalwithtip = total * (100 + tip)/100;

	multiplier = totalwithtip / subtotal;

	for (var i=0; i<orders.length; i++) {
		orders[i] = orders[i] * multiplier;
	}
}

function distribute() {
	
	moneyleft = new Array();
	moneyleft.length = payers.length;

	for (var i=0; i<moneyleft.length; i++) {
		moneyleft[i] = Math.floor(walletsizes[i] - orders[i]);
	}

	cash.sort(function(a,b) {
		return b.cents - a.cents;
	});
	var maxleft = Math.max.apply(Math, moneyleft);
	var maxindex = moneyleft.indexOf(maxleft);

	while (cash.length > 0 && cash[cash.length-1].cents <= maxleft) {

		var name = payers[maxindex];
		cash.sort(function(a,b) {
			if (a.cents == b.cents) {
				if (a.owner == name)
					return -1;
				else
					return 1;
			}
			else
				return b.cents - a.cents;
		});

		var i=0;
		while (cash[i].cents > maxleft)
			i++;

		var bill = cash.splice(i, 1)[0];
		var billcents = bill.cents;

		wallets[maxindex].push(bill);

		moneyleft[maxindex] -= billcents;

		var maxleft = Math.max.apply(Math, moneyleft);
		var maxindex = moneyleft.indexOf(maxleft);
	}
}

function display() {
	$('#results').empty();

	var exchanges = [];
	var total = 0;
	for (var i=0; i<cash.length; i++) {
		var bill = cash[i];
		var string = bill.owner + " $" + (bill.cents/100).toFixed() + " -> check";
		total += bill.cents;
		exchanges.push(string);
	}
	for (var p=0; p<payers.length; p++) {
		for (var i=0; i<wallets[p].length; i++) {
			var bill = wallets[p][i];
			if (payers[p] == bill.owner)
				continue;
			var string = bill.owner + " $" + (bill.cents/100).toFixed() + " -> " + payers[p];
			exchanges.push(string);
		}
	}

	$('#results').append("<p>"+exchanges.join("<br>")+"</p>");
	$('#results').append("<p>The total check is $" + (total/100).toFixed() + "</p>");

	var statuses = [];
	for (var i=0; i<payers.length; i++) {
		statuses.push(payers[i] + " is over by $" + (moneyleft[i]/100).toFixed());
	}
	$('#results').append("<p>"+statuses.join("<br>")+"</p>");
}
