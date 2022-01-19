require("dotenv").config();

const { Client, Intents, MessageEmbed } = require('discord.js');
const client = new Client({intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES
]})

client.login(process.env.TOKEN);

client.on('ready', () => {
    console.log("dice-bot RUNNED");
})

// ---------------------------------
const cmd = "-";
let game_started = false;

let player1_score = 0;
let player2_score = 0;
let player_turn = 1;

let player1, player2;

let played_time = 0;

// ======================
function rollDice() {
    return 1 + Math.floor(Math.random() * 6)
}
// ======================

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;

    if (message.content.startsWith(cmd)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(cmd.length)
            .split(/\s+/);


        setTimeout(() => {
            if(played_time === 6) {
                let winner;
                if(player1_score > player2_score) {
                    winner = 1
                } else if (player1_score < player2_score) {
                    winner = 2
                } else {
                    winner = 3
                }

                const doneEmbed = new MessageEmbed()
                .setColor('GOLD')
                .setTitle(`${winner === 3 ? "Game Done !!" : `${winner === 1 ? `${player1.user.username} Win !!` : `${player2.user.username} Win !!` }`}`)
                .setThumbnail(`${winner === 3 ? "" : `${winner === 1 ? `${player1.user.displayAvatarURL()}` : `${player2.user.displayAvatarURL()}`}`}`)
                .setDescription(`game done with **[${player1.user.username} = ${player1_score}]** ---- **[${player2.user.username} = ${player2_score}]**`)

                message.channel.send({embeds: [doneEmbed]})
                game_started = false
                played_time = 0
                player1 = null
                player2 = null
                player1_score = null
                player2_score = null
                player_turn = 1
            }
        }, 1000)

        if(CMD_NAME === "new-game"){
            if(!game_started) {
                const userID1 = args[0].match(/(\d+)/)
                const userID2 = args[1].match(/(\d+)/)

                player1 = await message.guild.members.cache.get(
                    userID1 ? userID1[0] : args[0]
                )

                player2 = await message.guild.members.cache.get(
                    userID2 ? userID2[0] : args[0]
                )

                if(player1 & player2) {
                    const startEmbed = new MessageEmbed()
                    .setColor('WHITE')
                    .setTitle('Game Strat !!')
                    .setDescription(`game start between **[${player1.user.username}]** & **[${player2.user.username}]**`)

                    message.channel.send({content: `${player1}, your turn | send -dice` ,embeds: [startEmbed]});
                    game_started = true;

                } else {
                    message.channel.send('tag 2 player')
                }
                
            } else {
                message.channel.send('now a game started, for first done your last game.')
            }
        }

        if(CMD_NAME === "dice") {
            if(game_started){
                if(message.member.id == (player_turn === 1 ? player1.user.id : player2.user.id)) {
                    const dice_score = rollDice()
    
                    const scoreEmbed = new MessageEmbed()
                    .setColor('WHITE')
                    .setTitle(`${player_turn === 1 ? player1.user.username : player2.user.username} Got **${dice_score}** score`)
                    .setDescription(`${player_turn === 1 ? player2 : player1}, now your turn`)
                    message.channel.send({embeds: [scoreEmbed]})
    
                    if(player_turn === 1) {
                        player1_score += dice_score
                        player_turn = 2
                        played_time += 1
                    } else {
                        player2_score += dice_score
                        player_turn = 1
                        played_time += 1
                    }
                } else {
                    message.channel.send("not your turn !")
                };
            } else {
                message.channel.send("for first, start a game ==> -new-game @player1 @player2")
            }
        }

        if(CMD_NAME === 'end-game') {
            const closeEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`Game Closed via ${message.member.user.username}`)
            .setDescription(`game closed with **[${player1?.user.username} = ${player1_score}]** ---- **[${player2?.user.username} = ${player2_score}]**`)

            message.channel.send({embeds: [closeEmbed]})
            game_started = false
            played_time = 0
            player1 = null
            player2 = null
            player1_score = null
            player2_score = null
            player_turn = 1
        }
    }
})