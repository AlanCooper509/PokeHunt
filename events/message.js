const pong = require('../commands/pong.js');
const pokemon_hunt = require('../commands/hunt.js');
const pokemon_list = require('../commands/list.js');
const pokemon_grow = require('../commands/grow.js');
const pokemon_care = require('../commands/care.js');
const pokemon_help = require('../commands/help.js');

const io = require('socket.io-client');
const socket = io.connect("https://pokemon-hunt.glitch.me/");

socket.on('connect', function (){
	console.log("connected to https://pokemon-hunt.glitch.me/!");
	socket.emit('discord');
});

module.exports = (client, message) => {

	if (message.content === 'ping') {
		return pong(message);
	}
	
	if (message.channel.name === 'pokemon')
	{
		if (message.content.toLowerCase() === 'hunt')
		{
			return pokemon_hunt(message);
		}
		else if (message.content.toLowerCase().startsWith('list'))
		{
			return pokemon_list(message, socket);
		}
		else if (message.content.toLowerCase().startsWith('evolve '))
		{
			return pokemon_grow(message);
		}
		else if (message.content.toLowerCase().startsWith('bring '))
		{
			return pokemon_care(message);
		}
		else if (!message.author.bot)
		{
			return pokemon_help(message);
		}
	}
}