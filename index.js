const TelegramApi = require("node-telegram-bot-api");
let { gameOptions, againOptions } = require("./options");
const sequelize = require("./db");
const token = "5854747712:AAHUeuThi2uWaUjwtb15E4KRwEqALyEqqKo";
const UserModel = require("./models");
const bot = new TelegramApi(token, { polling: true });

const chats = {};
let msgAnswer = null;

bot.setMyCommands([
  { command: "/start", description: "Начальное приветствие" },
  { command: "/info", description: "Получить информацию о пользователи" },
  { command: "/game", description: "Игра: угадай цифру" },
]);

const startGame = async (chatId) => {
  msgAnswer = await bot.sendMessage(
    chatId,
    "Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать!)"
  );

  console.log(msgAnswer.message_id);
  const randomNumber = Math.floor(Math.random() * 10);
  chats[chatId] = randomNumber;
  await bot.sendMessage(chatId, "Отгадывай", gameOptions).then((data) => {});
};

const start = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
  } catch (e) {
    console.log("Подключение к бд сломалось", e);
  }

  bot.on("message", async (msg) => {
    const text = msg.text;
    const chatId = msg.chat.id;

    try {
      if (text === "/start") {
        await UserModel.create({ chatId });
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
        const user = await UserModel.findOne({ chatId });
        return bot.sendMessage(
          chatId,
          `Тебя зовут ${msg.from.first_name}.\nВ игре у тебя:\nПравильных ответов: ${user.right}\nНе правильных ответов: ${user.wrong}`
        );
      }

      if (text === "/game") {
        return startGame(chatId);
      }
      return bot.sendMessage(chatId, "Я тебя не понимаю, попробуй еще раз!)");
    } catch (e) {
      const user = await UserModel.findOne({ chatId });
      const userId = user.dataValues.chatId;
      if (userId == msg.chat.id) {
        return bot.sendMessage(
          chatId,
          "Повторная регистрация запрещена!\nПерейдите в меню."
        );
      } else {
        return bot.sendMessage(chatId, "Произошла какая-то ошибка!");
      }
    }
  });

  bot.on("callback_query", async (query) => {
    const queryId = query.id;
    try {
      await bot.deleteMessage(query.message.chat.id, query.message.message_id);
      await bot.deleteMessage(query.message.chat.id, msgAnswer.message_id);
    } catch (e) {}

    console.log(queryId);
    const chatId = query.message.chat.id;
    const data = query.data;
    if (data === "/again") {
      await bot.answerCallbackQuery(queryId);
      return startGame(chatId);
    }
    const user = await UserModel.findOne({ chatId });

    if (data == chats[chatId]) {
      await bot.answerCallbackQuery(queryId);
      user.right += 1;
      await bot.sendMessage(
        chatId,
        `🥳 Поздравляю, ты отгадал цифру: ${chats[chatId]}`,
        againOptions
      );
    } else {
      bot.answerCallbackQuery(queryId);
      user.wrong += 1;
      await bot.sendMessage(
        chatId,
        `😔 К сожалению ты не угадал, бот загадал цифру: ${chats[chatId]}`,
        againOptions
      );
    }
    await user.save();
  });
};

start();
