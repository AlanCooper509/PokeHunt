const { RichEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

var message_;
var db_;

module.exports = message => {
	db_ = new sqlite3.Database('./data/memory.db');

	// Delete bot message request
	message_ = message;
	message.delete();

	// process pokemon name input
	var input = message_.content.substring(6)
		.split(' ')
		.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
		.join(' ')
		.split('(')
		.map(w => w[0].toUpperCase() + w.substr(1)) // Nidoran (F) and Nidoran (M)
		.join ('(')
		.split('-')
		.map(w => w[0].toUpperCase() + w.substr(1)) // Adjectives (Kind-Hearted)
		.join ('-');

	var pokemon;
	var adjective;
	var tokens = input.split(' ');
	
	if(Array.isArray(tokens)){
		adjective = tokens[0];
		tokens.shift();
		if(Array.isArray(tokens)){
			pokemon = tokens.join(' ');
		} else {
			pokemon = tokens;
		}
	} else {
		pokemon = input;
	}

	// Check if user typed a valid pokemon
	sql = `SELECT EXISTS(SELECT 1 FROM pokemon_properties
		WHERE pokemon_name = (?)) as count`;
	db_.get(sql, [pokemon], function(err, row) {
		if (err) return console.log('care.message() - ' + err.message);
		if (row.count == 0) {
			callback_tryInput(input); // edge case: no adjective, and pokemon is multiple words
		}
		else {
			callback_getData(pokemon, adjective);
		}
	});
}

function callback_tryInput(pokemon){
	sql = `SELECT EXISTS(SELECT 1 FROM pokemon_properties
		WHERE pokemon_name = (?)) as count`;
	db_.get(sql, [pokemon], function(err, row) {
		if (err) return console.log('care.message() - ' + err.message);
		if (row.count == 0) {
			callback_invalidPokemon();
		}
		else {
			callback_getData(pokemon, undefined);
		}
	});
}

function callback_getData(pokemon, adjective){
	if(adjective === undefined)
	{
		// bring the first entry (oldest caught by a specific user)
		var sql = `SELECT dogtag, adjective FROM caught_pokemon
			INNER JOIN pokemon_properties ON caught_pokemon.pokemon_id = pokemon_properties.pokemon_id
			INNER JOIN adjectives ON adjectives.adjective_id = caught_pokemon.adjective_id
			WHERE pokemon_name = (?) AND user_id = (?) ORDER BY timestamp`;
		db_.get(sql, [pokemon, message_.author.id], function(err, row) {
			if (err) return console.log('care.callback_getData() - ' + err.message);
			if (row === undefined) {
				callback_noPokemon(pokemon);
			} else {
				callback_bring(pokemon, row.dogtag, row.adjective);
			}
		});
	} else {
		// bring the first entry (oldest caught by a specific user for given adjective)
		var sql = `SELECT dogtag, caught_pokemon.pokemon_id FROM caught_pokemon
			INNER JOIN pokemon_properties ON caught_pokemon.pokemon_id = pokemon_properties.pokemon_id
			INNER JOIN adjectives ON adjectives.adjective_id = caught_pokemon.adjective_id
			WHERE pokemon_name = (?) AND user_id = (?) AND adjective = (?) ORDER BY timestamp`;
		db_.get(sql, [pokemon, message_.author.id, adjective], function(err, row) {
			if (err) return console.log('callback_getData() - ' + err.message);
			if (row === undefined) {
				callback_noAdjective(pokemon);
			} else {
				callback_bring(pokemon, row.dogtag, adjective);
			}
		});
	}
}

function callback_bring(pokemon, dogtag, adjective){
	var sql = `UPDATE favorite_pokemon SET adjective = (?), pokemon = (?), dogtag = (?) WHERE user_id = (?)`;
	var sql = `INSERT INTO favorite_pokemon VALUES ((?),(?),(?), (?))`;
	
/*
	db_.run(sql, [evo.evolution_id, dogtag], function(err) {
		if (err) return console.log('callback_evolve() - ' + err.message);
		callback_displayResult(pokemon, adjective, evo.evolution_name);
	});
}
*/
}

/*function callback_displayResult(pokemon, adjective, evolution){
	// message channel
	const embed = new RichEmbed()
		.setAuthor(message_.author.username, message_.author.avatarURL)
		.setTitle(evolution)
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/emerald/normal/' + evolution.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		.setDescription('Congratulations *' + message_.author.username + '!*\nYour ' 
			+ adjective + ' ' + pokemon + ' evolved into a ' + adjective + ' ' + evolution + '!');
	message_.channel.send(embed);
}
*/

function callback_invalidPokemon(){
	// message channel
	const embed = new RichEmbed()
		.setTitle(message_.author.username)
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/sun-moon/icon/unown.png')
		.setDescription(`Sorry, *` + message_.author.username + `*, I couldn't find that Pokemon!`);
	message_.channel.send(embed);
}

function callback_noPokemon(pokemon){
	// message channel
	const embed = new RichEmbed()
		.setAuthor(message_.author.username, message_.author.avatarURL)
		.setTitle(pokemon)
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/emerald/normal/' + pokemon.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		.setDescription('*' + message_.author.username + '* does not have ' + pokemon + '...');
	message_.channel.send(embed);
}

function callback_noAdjective(pokemon){
	// message channel
	const embed = new RichEmbed()
		.setAuthor(message_.author.username, message_.author.avatarURL)
		.setTitle(pokemon)
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/emerald/normal/' + pokemon.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		.setDescription('Currently, *' + message_.author.username + '* does not have that specific ' + pokemon + '...');
	message_.channel.send(embed);
}