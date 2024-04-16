const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModels');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModels');
const fs = require('fs');

dotenv.config({
  path: '/home/frey/Desktop/challenges/4-natours/starter/config.env',
});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`DB connected succesfully`));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
);

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('imported Data!');
  } catch (err) {
    console.log(err);
  }
  // process.exit();
};
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('deleted DB!');
  } catch (err) {
    console.log(err);
    // process.exit();
  }
};
if (process.argv[2] === '--delete') deleteData();
if (process.argv[2] === '--import') importData();
