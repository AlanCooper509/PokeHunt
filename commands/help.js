const { RichEmbed } = require('discord.js');

module.exports = message => {

	// Delete bot message request
	var user = message.author;
	var channel = message.channel;
	message.delete();
	
	// message channel
	const embed = new RichEmbed()
		.setColor(0xFF0000)
		.setThumbnail('https://img.pokemondb.net/sprites/sun-moon/icon/unown.png')
		.setDescription(`Hey there, *` + user.username + `!* Try one of the following **KNOWN** Commands:\n
		- hunt
		- list
		- list [@user]
		- list [pokemon]
		- evolve (adjective) [pokemon]`);
	channel.send(embed);
}