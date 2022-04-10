require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

// ================= START BOT CODE ===================
const Discord = require('discord.js');
const Database = require('@replit/database')
const Commands = require('./commands/commands.js');
const cmd = new Commands();

require('discord-reply');
const client = new Discord.Client();

client.on("guildCreate", async (guild) => {
    // This event triggers when the bot joins a guild.    
    console.log(`Joined new guild: ${guild.name}`);
    const user = await client.users.cache.get('355790921490759691').send(`Adicionado ao servidor: ${guild.name}`);
});

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setUsername("Wiki Bot");
});

client.on('message', msg => {
  if(msg.author.bot) return;
  if (msg.content === 'ping') {
    msg.lineReply('pong!');
  }
  if(msg.content.startsWith(process.env.BOT_PREFIX)){
    let command = msg.content.split(' ');
    let action = command[0];
    let args = command;
    args.shift();

    switch (action) {
      case `${process.env.BOT_PREFIX}find`:
        cmd.find(msg, args);
        break;
      case `${process.env.BOT_PREFIX}skinning`:
        cmd.skinning(msg, args);
        break;
      case `${process.env.BOT_PREFIX}drop`:
        cmd.drop(msg, args);
        break;
      case `${process.env.BOT_PREFIX}info`:
        cmd.info(msg, args);
        break;
      case `${process.env.BOT_PREFIX}help`:
        cmd.help(msg);
        break;
      case `${process.env.BOT_PREFIX}map`:
        cmd.map(msg);
        break;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);