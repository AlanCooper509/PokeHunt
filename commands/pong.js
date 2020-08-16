const { Attachment, Guild, RichEmbed } = require('discord.js');

module.exports = message => {
	//message.channel.send('Pong!');
	//message.reply('Pong!')
	//message.reply(message.author.avatarURL);
	message.channel.send(message.author.username);
	
	attachment = new Attachment('https://i.imgur.com/w3duR07.png');
	// Send the attachment in the message channel
	message.channel.send(attachment);
	
	const embed = new RichEmbed()
	// Set the title of the field
	  .setTitle('A slick little embed')
	// Set the color of the embed
	  .setColor(0xFF0000)
	// Set the main content of the embed
	.setDescription('Hello, this is a slick embed!');
    // Send the embed to the same channel as the message
    message.channel.send(embed);
	
	console.log(Guild.toString());
}