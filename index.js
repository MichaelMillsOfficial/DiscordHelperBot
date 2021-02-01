const dotenv = require('dotenv');
dotenv.config();

const { prefix, token } = require("./config.json");

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const FORMATTED_GAME_NAMES = require("./gamenames.json");

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

            // CHECK IF THE REQUESTING USER HAS ACCESS
            if(!message.member.roles.cache.some(r => r.name === "Admin") && !message.member.roles.cache.some(r => r.name === "Mod")) {
                message.reply(`Apologies, I can only service admins and moderators.`);
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
            if (!args.length || args.length < 2) {
                message.reply(`I need the name of a role first, followed by the name of the game!`);
                break;
            }

            var gameReminderDateString;

            if(args.length == 3) {
                // Handle a date passed in! Format can be mmddHHmm, mmddHH, [dayofweek0-6]HHmm, or [dayofweek0-6]HH
                var gameDate = args[2];
                if(gameDate.length == 6) {
                    var dateData = extractDateComponentsMonthDay(gameDate);
                    gameReminderDateString = ` on ${dateData.month} ${dateData.day}, at ${dateData.hour} o'clock`;
                } else if(gameDate.length == 8) {
                    var dateData = extractDateComponentsMonthDay(gameDate);
                    gameReminderDateString = ` on ${dateData.month} ${dateData.day}, at ${dateData.hour}:${dateData.minute}`;
                } else if(gameDate.length == 5) {
                    var dateData = extractDateComponentsDayOfWeek(gameDate);
                    gameReminderDateString = ` on ${dateData.dayofweekName}, at ${dateData.hour}:${dateData.minute}`;
                } else if(gameDate.length == 3) {
                    var dateData = extractDateComponentsDayOfWeek(gameDate);
                    gameReminderDateString = ` on ${dateData.dayofweekName}, at ${dateData.hour} o'clock`;
                }
            }

            // Try to find the role!
            var roleManager = message.guild.roles;
            roleManager.fetch().then(roles => {
                roles.cache.forEach(role => {
                    if (role.name === args[0]) {
                        // Ladies and gentlemen, we got em
                        // Construct str
                        var gameName = args[1];
                        if(FORMATTED_GAME_NAMES.hasOwnProperty(args[1])) {
                            gameName = FORMATTED_GAME_NAMES[gameName];
                        }
                        var reminderMessage = `<@&${role.id}>, ${message.author} would like to play ${gameName}`;
                        if(gameReminderDateString) {
                            reminderMessage += gameReminderDateString;
                        }
                        reminderMessage += `! Please react using an emoji to show if you are interested!`; 
                        message.channel.send(reminderMessage).then(botMessage => {
                            botMessage.react("✅").then(() => botMessage.react("❌")).then(() => botMessage.react("🤔"));
                        })
                    }
                })
            })
            break;

        default:
            console.log(`I don't understand the command ${command}!`);

    }

    function extractDateComponentsMonthDay(input) {
        var month = Number.parseInt(input.substr(0,2));
        var monthName = months[month - 1]; // Use month - 1 to make it 0 index friendly
        var day = Number.parseInt(input.substr(2,2));
        var hour = Number.parseInt(input.substr(4,2));
        var minute = undefined;
        if(input.length == 8) {
            minute = Number.parseInt(input.substr(6,2));
        }
        return {
            month: monthName,
            day: day,
            hour: hour,
            minute: minute
        }
    }

    function extractDateComponentsDayOfWeek(input) {
        var dayofweek = Number.parseInt(input.substr(0,1));
        var dayofweekName = days[dayofweek];
        var hour = Number.parseInt(input.substr(1,2));
        var minute = undefined;
        if(input.length == 5) {
            minute = Number.parseInt(input.substr(3,2));
        }
        return {
            dayofweekName: dayofweekName,
            hour: hour,
            minute: minute
        }
    }
});