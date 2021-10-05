'use strict';

require('dotenv').config();

const Database = require('./util/Database');
const Classroom = require('./util/Classroom');

const database = new Database();
const classroom = new Classroom(database);

module.exports = classroom;
