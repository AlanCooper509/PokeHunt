const pokemon_uniq = require('../commands/uniq.js');
const pokemon_user = require('../commands/user.js');
const pokemon_help = require('../commands/help.js');

module.exports = (message, socket) => {
	if (message.content.toLowerCase() === 'list' || message.mentions.users.size > 0)
	{
		return pokemon_user(message, socket);
	}
	else if (message.content.toLowerCase().startsWith('list '))
	{
		return pokemon_uniq(message);
	}
	else
	{
		return pokemon_help(message);
	}
}