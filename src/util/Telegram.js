'use strict';

const axios = require('axios');

const { BOT_TOKEN, CHAT_ID } = process.env;

module.exports = class Telegram extends null {
  static async sendMessage(text, options = {}) {
    try {
      const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
      const body = { chat_id: options.chatID ?? CHAT_ID, text, parse_mode: 'HTML', ...options.params };
      await axios.post(url, body);
    } catch (err) {
      console.error(err);
      return false;
    }

    return true;
  }
};
