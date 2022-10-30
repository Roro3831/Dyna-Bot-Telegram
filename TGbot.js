const TelegramBot = require('node-telegram-bot-api');
require("dotenv").config();
const token = process.env.TELEGRAM_BOT_TOKEN;

const bot = new TelegramBot(token,{polling : true});
// const chatId = @Test
bot.sendMessage("-1001772396973","Bot connected");


bot.on('message', (msg) => {
    var Hi = "???";
    if (msg.text.toString().toLowerCase().indexOf(Hi) === 0) {
    bot.sendMessage(msg.chat.id,"I am stil here !");
    }
    });