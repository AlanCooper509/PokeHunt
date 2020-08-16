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
	var pokemon = message_.content.substring(5)
		.split(' ')
		.map(w => w[0].toUpperCase() + w.substr(1).toLowerCase())
		.join(' ')
		.split('(')
		.map(w => w[0].toUpperCase() + w.substr(1)) // Nidoran (F) and Nidoran (M)
		.join ('(');
	
	// Check if user typed a valid pokemon
	sql = `SELECT EXISTS(SELECT 1 FROM pokemon_properties
		WHERE pokemon_name = (?)) as count`;
	db_.get(sql, [pokemon], function(err, row) {
		if (err) {
			return console.log('uniq.message() - ' + err.message);
		}
		if (row.count == 0) {
			callback_noData(pokemon);
		}
		else {
			callback_getData(pokemon);
		}
	});
}

function callback_noData(pokemon){
	// message channel
	const embed = new RichEmbed()
		.setTitle('Unown List Command')
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/sun-moon/icon/unown.png')
		.setDescription(`Sorry, *` + message_.author.username + `*, I couldn't find that Pokemon!`);
	message_.channel.send(embed);
}

function callback_getData(pokemon){
	sql = `SELECT adjective, pokemon_name FROM caught_pokemon
		INNER JOIN pokemon_properties ON caught_pokemon.pokemon_id = pokemon_properties.pokemon_id
		INNER JOIN adjectives ON caught_pokemon.adjective_id = adjectives.adjective_id
		WHERE pokemon_name = (?) AND user_id = (?) ORDER BY adjective`;
	db_.all(sql, [pokemon, message_.author.id], function(err, rows) {
		if (err) {
			return console.log('callback_getData() - ' + err.message);
		}
		if (rows[0] === undefined)
		{
			callback_displayNoData(pokemon);
		}
		else
		{
			callback_displayData(rows);
		}
	});
}

function callback_displayNoData(pokemon) {
	// message channel
	const embed = new RichEmbed()
		.setAuthor(message_.author.username, message_.author.avatarURL)
		.setTitle(pokemon)
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/emerald/normal/' + pokemon.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
		.setDescription('*' + message_.author.username + '* has not found **' + pokemon + '** yet...');
	message_.channel.send(embed);
}

function callback_displayData(query) {
	var output = '';
	var shinyCount = 0;
	var uniqueCount = 0;
	var prev = '';
	var curr = '';
	query.forEach(function(row, index){
		// append to output string
		if(index != 0) output += '\n';
		output += row.adjective + ' ' + row.pokemon_name;
		
		// count shinies
		if(row.adjective === 'Shiny') shinyCount++;
		
		// count unique adjectives
		curr = row.adjective;
		uniqueCount = prev !== curr ? uniqueCount++ : uniqueCount;
		prev = curr;
	});
	
	// message channel
	const embed = new RichEmbed()
	  .setAuthor(message_.author.username, message_.author.avatarURL)
	  .setColor(0xFF0000)
	  .setThumbnail('https://img.pokemondb.net/sprites/emerald/normal/' + query[0].pokemon_name.toLowerCase().replace(/[^a-zA-Z ]/g, '').replace(' ', '-') + '.png')
	  .addField("__" + query[0].pokemon_name + " Hunts__", 
	    '**' + query.length + '** total ' + query[0].pokemon_name + '\n' +
		'**' + query.length + '** unique ' + query[0].pokemon_name + '\n' +
		'**' + shinyCount + '** shiny ' +  query[0].pokemon_name)
	  .addField("__" + message_.author.username + "'s " + query[0].pokemon_name + " List__", output);
	message_.channel.send(embed);
}