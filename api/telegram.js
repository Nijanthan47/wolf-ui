export default async function handler(req, res) {
  const BOTS = {
    wolf: {
      token: process.env.WOLF_TOKEN,
      chatId: "6056504954"
    },
    cwolf: {
      token: "TOKEN_2",
      chatId: "CHAT_ID_2"
    },
    fwolf: {
      token: "TOKEN_3",
      chatId: "CHAT_ID_3"
    },
    swolf: {
      token: "TOKEN_4",
      chatId: "CHAT_ID_4"
    }
  };

  const result = {};

  for (const [name, bot] of Object.entries(BOTS)) {
    try {
      const tg = await fetch(
        `https://api.telegram.org/bot${bot.token}/getUpdates?limit=1`
      );

      const data = await tg.json();

      const messages = (data.result || []).filter(
        m => m.message?.chat?.id == bot.chatId
      );

      const lastMsg =
        messages.slice(-1)[0]?.message?.text || "--";

      result[name] = lastMsg;

    } catch (err) {
      result[name] = "OFFLINE";
    }
  }

  res.status(200).json(result);
}