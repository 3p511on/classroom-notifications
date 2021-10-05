'use strict';

const Telegram = require('../util/Telegram');

const names = { 0: 'ое задание', 1: 'ое объявление', 2: 'ый материал' };
const emojis = { 0: '📝', 1: '📢', 2: '📚' };
module.exports = (database, newTask, type) => {
  try {
    const teacher = database.teachers.find(i => i.userId === newTask.creatorUserId);
    const teacherName = teacher ? teacher.profile.name.fullName : 'Аноним';

    const notificationText = [
      `<b>${emojis[type]} Нов${names[type]} в Classroom - ${teacherName}</b>\n`,
      newTask.title ? `<b>Название:</b> <code>${newTask.title}</code>` : null,
      newTask.text || newTask.description ? `<code>${newTask.text || newTask.description}</code>\n` : null,
      newTask.dueDate ? `<b>Дата сдачи:</b> <code>${parseDueDate(newTask).toLocaleString()}</code>` : null,
      newTask?.materials?.length > 0 ? `<b>Прикреплено материалов:</b> <code>${newTask.materials.length}</code>` : null,
      `<b><a href="${newTask.alternateLink ? newTask.alternateLink : 'пропало'}">Ссылка на задание</a></b>`,
    ];

    Telegram.sendMessage(notificationText.filter(i => !!i).join('\n'));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

function parseDueDate(task) {
  const date = `${task.dueDate.year}-${task.dueDate.month}-${task.dueDate.day}`;
  const time = `${task?.dueTime?.hours ? task?.dueTime?.hours : 0}:${
    task?.dueTime?.minutes ? task?.dueTime?.minutes : 0
  }:${task?.dueTime?.minutes ? task?.dueTime?.minutes : 0}`;
  return new Date(`${date} ${time}`);
}
