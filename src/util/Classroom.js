'use strict';

const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

const checkNew = require('../schedules/checkNew');

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly',
  'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
];
const TOKEN_PATH = 'token.json';
const { COURSE_ID } = process.env;

module.exports = class Classroom {
  constructor(database) {
    this.database = database;
    this.credentials = this.getCredentials();

    this.authorize(this.credentials, oAuth2Client => {
      this.oAuth2Client = oAuth2Client;
      this.client = google.classroom({ version: 'v1', auth: this.oAuth2Client });
      console.log('[Classroom] Авторизовано');

      this.getTeachers(COURSE_ID, teachers => this.database.setTeachers(teachers));

      checkNew(this);
      setInterval(() => checkNew(this), 60 * 1000);
    });
  }

  getCredentials() {
    return JSON.parse(fs.readFileSync('credentials.json', 'utf-8'));
  }

  authorize({ installed }, callback) {
    const { client_secret: clientSecret, client_id: clientID, redirect_uris: redirectURIs } = installed;
    const oAuth2Client = new google.auth.OAuth2(clientID, clientSecret, redirectURIs[0]);

    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return this.getNewToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  getNewToken(oAuth2Client, callback) {
    const authURL = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
    console.log('Авторизуйтесь, используя эту ссылку:', authURL);

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Введите код с страницы:', code => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) throw err;
        oAuth2Client.setCredentials(token);

        fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
          if (err) throw err;
          console.log('Токен сохранен в', TOKEN_PATH);
        });

        callback(oAuth2Client);
      });
    });
  }

  async listCourses() {
    const res = await this.client.courses.list({ pageSize: 10 });
    const courses = res.data.courses;
    if (!courses?.length) return null;
    return courses;
  }

  async listAnnouncements(courseID) {
    const res = await this.client.courses.announcements.list({ courseId: courseID });
    const announcements = res.data.announcements;
    return announcements;
  }

  async listMaterials(courseID) {
    const res = await this.client.courses.courseWorkMaterials.list({ courseId: courseID });
    const courseWorkMaterial = res.data.courseWorkMaterial;
    return courseWorkMaterial;
  }

  async listTasks(courseID) {
    const res = await this.client.courses.courseWork.list({ courseId: courseID });
    const courseWork = res.data.courseWork;
    return courseWork;
  }

  async getTeachers(courseID, cb) {
    const res = await this.client.courses.teachers.list({ courseId: courseID });
    const teachers = res.data.teachers;
    if (typeof cb === 'function') return cb(teachers);
    return teachers;
  }
};
