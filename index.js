const dotenv = require('dotenv');
dotenv.config();

const { prefix, token } = require("./config.json");

const Discord = require('discord.js');
const client = new Discord.Client();

client.once('ready', () => {
    console.log('Ready!');
});

client.login(token);

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch (command) {
        case "ping":
            message.channel.send('Pong.');
            break;
        case "server":
            message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
            break;
        case "user-info":
            message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.id}`);
            break;
        case "create-role":
            if (!args.length) {
                message.reply(`I need the name of the role to create!`);
                break;
            }
            var roleManager = message.guild.roles;
            // Check if a role already exists
            var isDupe = false;
            roleManager.fetch().then(roles => {
                roles.cache.forEach(role => {
                    if (role.name === args[0]) {
                        isDupe = true;
                        console.log("Found dupe!");
                        return;
                    }
                })
                if (isDupe) {
                    message.reply(`There is already a role named ${args[0]}`);
                    return;
                }
                roleManager.create({
                    data: {
                        name: args[0]
                    }
                }).then(message.reply(`I have succesfully created the ${args[0]} role!`))
                    .catch((e) => {
                        message.reply("Whoopsie doodle, I had a bit of a problem! Try again or do it yourself.")
                        console.log('Catch', e);
                    });
            });

            break;
        case "game-reminder": 
            if (!args.length || args.length != 2) {
                message.reply(`I need the name of a role first, followed by the name of the game!`);
                break;
            }

            // Try to find the role!
            var roleManager = message.guild.roles;
            roleManager.fetch().then(roles => {
                roles.cache.forEach(role => {
                    if (role.name === args[0]) {
                        // Ladies and gentlemen, we got em
                        message.channel.send(`<@&${role.id}>, ${message.author} would like to play ${args[1]}! Please react using an emoji to determine if you are interested!`).then(botMessage => {
                            botMessage.react("✅").then(() => botMessage.react("❌")).then(() => botMessage.react("🤔"));
                        })
                    }
                })
            })
            break;

        default:
            console.log(`I don't understand the command ${command}!`);

    }
});