const { RichEmbed } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();

var message_;
var socket_;
var user_;
var db_;

module.exports = (message, socket) => {
	socket_ = socket;
	db_ = new sqlite3.Database('./data/memory.db');
	
	// Delete bot message request
	message_ = message;
	message.delete();
	
	// Check if too many users requested
	if (message_.mentions.users.size > 1) {
		badParsing();
	}
	else {
		if (message_.mentions.users.size == 1) {
			user_ = message_.mentions.users.entries().next().value[1];
		}
		else {
			user_ = message_.author;
		}
		
		// Check if user has caught any pokemon
		db_.get('SELECT count(*) as count FROM caught_pokemon WHERE user_id = ' + user_.id, function(err, row) {
			if (err) {
				return console.log('user.message() - ' + err.message);
			}
			else if (row.count == 0) {
				callback_noData();
			}
			else {
				callback_getData();
			}
		});		
	}
}

function badParsing() {
	// message channel
	const embed = new RichEmbed()
		.setColor(0xFF0000)
		.setTitle('Unown List Command')
		.setThumbnail('https://img.pokemondb.net/sprites/sun-moon/icon/unown.png')
		.setDescription('Only one user can be listed at a time!');
	message_.channel.send(embed);
}

function callback_noData() {	
	// message channel
	const embed = new RichEmbed()
	  .setAuthor(user_.username, user_.avatarURL)
	  .setColor(0xFF0000)
	  .setThumbnail(user_.avatarURL)
	  .setDescription('Currently, *' + user_.username + '* has no Pokemon!');
	message_.channel.send(embed);
}

function callback_getData() {
	var query = `SELECT caught_pokemon.pokemon_id, pokemon_properties.pokemon_name, count(*) as count FROM caught_pokemon
	  INNER JOIN pokemon_properties ON caught_pokemon.pokemon_id = pokemon_properties.pokemon_id 
	  WHERE caught_pokemon.user_id = (?) GROUP BY caught_pokemon.pokemon_id`
	db_.all(query, [user_.id], function(err, rows) {
		if (err) {
			return console.log('user.callback_getData() - ' + err.message);
		}
		socket_.emit('list', [user_.id, user_.username, rows]); // send to glitch.me server
		callback_addData(rows);

	});
}

function callback_addData(data) {
	var query = `SELECT adjectives.adjective, pokemon_properties.pokemon_name FROM caught_pokemon
	  INNER JOIN pokemon_properties ON caught_pokemon.pokemon_id = pokemon_properties.pokemon_id
	  INNER JOIN adjectives ON caught_pokemon.adjective_id = adjectives.adjective_id
	  WHERE caught_pokemon.user_id = (?) AND adjectives.adjective = 'Shiny'`
	db_.all(query, [user_.id], function(err, rows) {
		if (err) {
			return console.log('user.callback_addData() - ' + err.message);
		}
		callback_displayData(data, rows);
	});
}

function callback_displayData(data, shinies) {

	// get statistics here
	var totalSum = 0;
	data.forEach(function(row, index){
		totalSum += row.count;
	});
	
	// message channel
	const embed = new RichEmbed()
	  .setAuthor(user_.username, user_.avatarURL)
	  .setColor(0xFF0000)
	  .setThumbnail(user_.avatarURL)
	  .addField("__" + user_.username + "'s Hunting Stats__", 
		'**' + totalSum + '** total Pokemon\n' +
	    '**' + data.length + '** unique Pokemon\n' + 
		'**' + shinies.length + '** shiny Pokmeon')
	  .addField("__" + user_.username + "'s Pokedex__", 'https://pokemon-hunt.glitch.me/#' + user_.id);
	message_.channel.send(embed);	
}