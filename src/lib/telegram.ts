export async function sendTelegramMessage(
  message: string,
  userId: string
): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  let chatId = null;
  if (userId === "2") {
    chatId = process.env.ARTEM_TELEGRAM_CHAT_ID;
  } else {
    chatId = process.env.VALERIA_TELEGRAM_CHAT_ID;
  }

  if (!botToken || !chatId) {
    console.warn(
      "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set. Skipping Telegram notification."
    );
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Telegram API error:", errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Telegram message:", error);
    return false;
  }
}

export function formatCalendarEntryMessage(
  userName: string,
  date: Date,
  color: string,
  note: string | null,
  isUpdate: boolean
): string {
  const dateStr = date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const colorEmoji: Record<string, string> = {
    RED: "🔴",
    YELLOW: "🟡",
    GREEN: "🟢",
  };

  const colorText: Record<string, string> = {
    RED: "Красный",
    YELLOW: "Желтый",
    GREEN: "Зеленый",
  };

  const action = isUpdate ? "обновлен" : "добавлен";
  const emoji = colorEmoji[color] || "⚪";
  const colorName = colorText[color] || color;

  let message = `📅 <b>Календарь ${action}</b>\n\n`;
  message += `📆 Дата: <b>${dateStr}</b>\n`;
  message += `🎨 Цвет: ${emoji} <b>${colorName}</b>\n`;

  if (note && note.trim()) {
    message += `📝 Описание:\n${note}`;
  }

  return message;
}
