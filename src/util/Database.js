'use strict';

const fs = require('fs');

module.exports = class Database {
  constructor() {
    this.patchData();
  }

  patchData() {
    this.lastTask = JSON.parse(fs.readFileSync('database/lastTask.json', 'utf-8'));
    this.activeTasks = JSON.parse(fs.readFileSync('database/activeTasks.json', 'utf-8'));
    this.teachers = JSON.parse(fs.readFileSync('database/teachers.json', 'utf-8'));
    return this;
  }

  setLastTask(type, task) {
    this.lastTask[type] = task;
    fs.writeFileSync('database/lastTask.json', JSON.stringify(this.lastTask));
    return this;
  }

  addActiveTask(task) {
    this.activeTasks.push(task);
    fs.writeFileSync('database/activeTasks.json', JSON.stringify(this.activeTasks));
    return this;
  }

  removeActiveTask(task) {
    this.activeTasks = this.activeTasks.filter(i => i !== (typeof task === 'object' && task.id ? task.id : task));
    fs.writeFileSync('database/activeTasks.json', JSON.stringify(this.activeTasks));
    return this;
  }

  setTeachers(teachers) {
    this.teachers = teachers;
    fs.writeFileSync('database/teachers.json', JSON.stringify(this.teachers));
    return this;
  }
};
