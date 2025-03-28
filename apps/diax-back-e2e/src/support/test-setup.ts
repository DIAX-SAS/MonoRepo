import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({
  path: "apps/diax-back-e2e/.env"
});
module.exports = async function () {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ?? '3000';
  axios.defaults.baseURL = `http://${host}:${port}`;
};
