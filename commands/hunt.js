const { RichEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

var message_;
var db_;

class Pokemon
{
	constructor(id, name) {
		this.id = id;
		this.name = name;
	}
}

class Adjective
{
	constructor(id, adjective){
		this.id = id;
		this.word = adjective;
	}
}

module.exports = message => {
	// load db file
	db_ = new sqlite3.Database('./data/memory.db');

	// Delete bot message request
	message_ = message;
	message.delete();

	// Later functionality (and synchronization) achieved using callback functionss
	loadPokemonTable();
}

function loadPokemonTable() {
	db_.get('SELECT count(*) as count FROM pokemon_properties', function(err, row) {
		if (err) {
			return console.log('loadPokemonTable() - ' + err.message);
		}
		var pokemonID = Math.floor(Math.random() * row.count) + 1;
		callback_getPokemon(pokemonID);
	});
}

function callback_getPokemon(index) {
	db_.get('SELECT pokemon_id id, pokemon_name name FROM pokemon_properties WHERE pokemon_id = ' + index, (err, row) => {
		if (err) {
			return console.log('callback_getPokemon() - ' + err.message);
		}
		var pokemon = new Pokemon(index, row.name);
		callback_loadAdjectiveTable(pokemon);
	});
}

function callback_loadAdjectiveTable(pokemon)
{
	db_.all('SELECT adjective_id as id FROM adjectives', function(err, rows) {
		if (err) {
			return console.log('callback_loadAdjectiveTable() - ' + err.message);
		}
		var adjectiveID = rows[Math.floor(Math.random() * rows.length)].id;
		callback_getAdjective(adjectiveID, pokemon);
	});
}

function callback_getAdjective(index, pokemon) {
	db_.get('SELECT adjective_id id, adjective name FROM adjectives WHERE adjective_id = ' + index, function(err, row) {
		if (err) {
			return console.log('callback_getAdjective() - ' + err.message);
		}
		var adjective = new Adjective(index, row.name);
		callback_channelOutput(adjective, pokemon);
		callback_addPokemonCapture(adjective, pokemon);
	});	
}

function callback_channelOutput(adjective, pokemon) {
	var grammar = (/^[aeiou]$/i).test(adjective.word[0]) ? 'an ' : 'a ';
	
	if(adjective.word === 'Shiny') {
		const embed = new RichEmbed()
		  .setTitle(pokemon.name)
		  .setColor(0xFF0000)
		  .setThumbnail('https://img.pokemondb.net/sprites/emerald/shiny/' + pokemon.name.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		  .setDescription('*' + message_.author.username + '* caught ' + grammar + adjective.word + ' ' + pokemon.name + '!');
		message_.channel.send(embed);
	}
	else {
		const embed = new RichEmbed()
		  .setTitle(pokemon.name)
		  .setColor(0xFF0000)
		  .setThumbnail('https://img.pokemondb.net/sprites/sun-moon/icon/' + pokemon.name.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		  .setDescription('*' + message_.author.username + '* caught ' + grammar + adjective.word + ' ' + pokemon.name + '!');
		message_.channel.send(embed);
	}
}

function callback_addPokemonCapture(adjective, pokemon) {
	db_.run('INSERT INTO caught_pokemon(adjective_id, pokemon_id, user_id, timestamp) VALUES((?), (?), (?), (?));', 
	  [adjective.id, pokemon.id, message_.author.id, message_.createdTimestamp],
	  function(err) {
		if (err) {
			return console.error('callback_addPokemonCapture() - ' + err.message);
		}
	});
}