'use strict';

const handleNew = require('../handlers/handleNew');
const { COURSE_ID } = process.env;

module.exports = async classroom => {
  try {
    const { database } = classroom;

    // const courses = await classroom.listCourses();
    // console.log(courses);

    // Get tasks and compare them
    const tasks = await classroom.listTasks(COURSE_ID);
    if (tasks && database?.lastTask?.task?.id !== tasks[0].id) {
      handleNew(database, tasks[0], 0);
      database.setLastTask('task', tasks[0]);
      database.addActiveTask(tasks[0]);
    }

    // Get announcements
    const announcements = await classroom.listAnnouncements(COURSE_ID);
    if (announcements && database?.lastTask?.announcement?.id !== announcements[0].id) {
      handleNew(database, announcements[0], 1);
      database.setLastTask('announcement', announcements[0]);
    }

    // Get materials
    const materials = await classroom.listMaterials(COURSE_ID);
    if (materials && database?.lastTask?.material?.id !== materials[0].id) {
      handleNew(database, materials[0], 2);
      database.setLastTask('material', materials[0]);
    }
  } catch (err) {
    console.error(err);
  }
};
