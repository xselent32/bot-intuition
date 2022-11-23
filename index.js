const TelegramApi = require("node-telegram-bot-api");
const {gameOptions, againOptions} = require("./options")

const token = "5854747712:AAHUeuThi2uWaUjwtb15E4KRwEqALyEqqKo";

const bot = new TelegramApi(token, { polling: true });

const chats = {};



bot.setMyCommands([
  { command: "/start", description: "Начальное приветствие" },
  { command: "/info", description: "Получить информацию о пользователи" },
  { command: "/game", description: "Игра угадай цифру" },
]);

const startGame = async (chatId) => {
  await bot.sendMessage(
    chatId,
    "Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!)"
  );
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions);
};

const start = () => {
  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
      await bot.sendSticker(
        chatId,
        "https://tlgrm.ru/_/stickers/25e/c00/25ec00bf-b329-37bd-a78c-a148539e049f/1.webp"
      );

      return bot.sendMessage(
        chatId,
        `Добро пожаловать в телеграм бот для развития интуиции 💪`
      );
    }

    if (text === "/info") {
      return bot.sendMessage(
        chatId,
        `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}`
      );
    }

    if (text === "/game") {
      return startGame(chatId);
    }
    return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз!)");
  });

  bot.on("callback_query", async (msg) => {
    const chatId = msg.message.chat.id;
    const data = msg.data;
    if (data === "/again") {
        return startGame(chatId);
    }

    if (data === chats[chatId]) {
      return await bot.sendMessage(
        chatId,
        `🥳 Поздравляю, ты отгадал цифру: ${chats[chatId]}`,
        againOptions
      );
    } else {
      return await bot.sendMessage(
        chatId,
        `😔 К сожалению ты не угадал, бот загадал цифру: ${chats[chatId]}`,
        againOptions
      );
    }
  });
};

start();
