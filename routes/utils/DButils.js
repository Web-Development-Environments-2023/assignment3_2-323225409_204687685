require("dotenv").config();
const MySql = require("./MySql");

let connection;

exports.execQuery = async function (query) {
  let returnValue = [];
  connection = await MySql.connection();
  try {
    await connection.query("START TRANSACTION");
    returnValue = await connection.query(query);
    await connection.query("COMMIT");
  } catch (err) {
    await connection.query("ROLLBACK");
    console.log('ROLLBACK at querySignUp', err);
    throw err;
  } finally {
    await connection.release();
  }
  return returnValue;
};

exports.commit = async function () {
  try {
    await connection.query("COMMIT");
  } catch (err) {
    await connection.query("ROLLBACK");
    console.log('ROLLBACK at commit', err);
    throw err;
  } finally {
    await connection.release();
  }
};