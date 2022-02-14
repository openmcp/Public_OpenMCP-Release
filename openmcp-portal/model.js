/**
 * Module dependencies.
 */

//  var pg = require('pg-promise')(process.env.DATABASE_URL);
const { Client } = require("pg");
const fs = require("fs");
const data = fs.readFileSync("./config.json");
const conf = JSON.parse(data);
// var os = require("os");
// var path = require("path");


// const isLocal = true;
const isLocal = process.env.api_url === undefined;
if (!isLocal) {
  conf.db.user = process.env.db_user;
  conf.db.host = process.env.db_host;
  conf.db.database = process.env.db_database;
  conf.db.password = process.env.db_password;
  conf.db.port = process.env.db_port;
}


/*
 * Get access token.d
 */
const pg = new Client({
  user: conf.db.user,
  host: conf.db.host,
  database: conf.db.database,
  password: conf.db.password,
  port: conf.db.port,
});

pg.connect();
module.exports.getAccessToken = function (bearerToken) {
  console.log("getAccessToken");
  return pg
    .query(
      "SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE access_token = $1",
      [bearerToken]
    )
    .then(function (result) {
      var token = result.rows[0];
      return {
        accessToken: token.access_token,
        client: { id: token.client_id },
        accessTokenExpiresAt: token.access_token_expires_on,
        user: { id: token.user_id }, // could be any object
      };
    });
};

/**
 * Get refresh token.
 */


 function getDateTime() {
  var d = new Date();
  d = new Date(d.getTime());
  var date_format_str =
    d.getFullYear().toString() +
    "-" +
    ((d.getMonth() + 1).toString().length == 2
      ? (d.getMonth() + 1).toString()
      : "0" + (d.getMonth() + 1).toString()) +
    "-" +
    (d.getDate().toString().length == 2
      ? d.getDate().toString()
      : "0" + d.getDate().toString()) +
    " " +
    (d.getHours().toString().length == 2
      ? d.getHours().toString()
      : "0" + d.getHours().toString()) +
    ":" +
    // ((parseInt(d.getMinutes() / 5) * 5).toString().length == 2
    //   ? (parseInt(d.getMinutes() / 5) * 5).toString()
    //   : "0" + (parseInt(d.getMinutes() / 5) * 5).toString()) +
    // ":00";
    (d.getMinutes().toString().length == 2
      ? d.getMinutes().toString()
      : "0" + d.getMinutes().toString()) +
    ":" +
    (d.getSeconds().toString().length == 2
      ? d.getSeconds().toString()
      : "0" + d.getSeconds().toString());
  // console.log(date_format_str);
  return date_format_str;
}


module.exports.getRefreshToken = function* (bearerToken) {
  let now = getDateTime();
  console.log(now)
  return pg
    .query(
      "SELECT access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id FROM oauth_tokens WHERE refresh_token = $1 and refresh_token_expires_on >= $2",
      [bearerToken, now]
    )
    .then(function (result) {
      console.log("getRefreshToken", result.rowCount);
      if(result.rowCount > 0 ){
        let res = {
          refresh_token : result.rows[0].refresh_token,
          client : {
            clientId : 'openmcp-client',
            clientSecret : 'openmcp-secret',
            grants: ["password", "refresh_token"]
          },
          user : { id: result.rows[0].user_id }
        }
        return res;
      } else {
        console.log('error')
        let res = {
          refresh_token : bearerToken,
          client : {
            clientId : 'openmcp-client',
            clientSecret : 'openmcp-secret',
            grants: ["password", "refresh_token"]
          },
          user : { message : "Refresh token has expired"}
        }
        return res;
      }


      // {
      //   clientId: oAuthClient.client_id,
      //   clientSecret: oAuthClient.client_secret,
      //   grants: ["password", "refresh_token"], // the list of OAuth2 grant types that should be allowed
      // };

      // return {
      //   clientId: token.clientId,
      //   expires: token.refreshTokenExpiresOn,
      //   refreshToken: token.accessToken,
      //   userId: token.userId
      // };
    });
};

/*
 * Save token.
 */
//3.
module.exports.saveToken = function* (token, client, user) {
  //  var query = `INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ('${token.accessToken}', '${token.accessTokenExpiresAt}', '${client.clientId}', '${token.refreshToken}', '${token.refreshTokenExpiresAt}', '${user.id}')`
  //  console.log(query);
  
  if(user.hasOwnProperty("message")){
    var newToken = {
      accessToken: "fail",
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      refreshToken: user.message,
      client:client,
      user:user,
    };

    return newToken;
  }


  return pg
    .query(
      `INSERT INTO oauth_tokens(access_token, access_token_expires_on, client_id, refresh_token, refresh_token_expires_on, user_id) VALUES ($1, $2, $3, $4, $5, $6);
      `,
      [
        token.accessToken,
        token.accessTokenExpiresAt,
        client.clientId,
        token.refreshToken,
        token.refreshTokenExpiresAt,
        user.id,
      ]
    )
    .then(function (result) {
      // console.log("result", result, result.rowCount, result.rows[0]);

      var newToken = {
        accessToken: token.accessToken,
        accessTokenExpiresAt: token.accessTokenExpiresAt,
        clientId: client.clientId,
        refreshToken: token.refreshToken,
        refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        userId: user.id,

        //these are required in /node_modules/express-oauth-server/node_modules/oauth2-server/lib/models/token-model.js
        client: client,
        user: user,
        scope: null, //where are we taking scope from? maybe client?
      };

      result.rows[0];
      return result.rowCount ? newToken : false; // TODO return object with client: {id: clientId} and user: {id: userId} defined
    });
};

/*
 * Get client.
 */
// 1.
module.exports.getClient = function* (clientId, clientSecret) {
  console.log("getClient");
  return pg
    .query(
      "SELECT client_id, client_secret, redirect_uri FROM oauth_clients WHERE client_id = $1 AND client_secret = $2",
      [clientId, clientSecret]
    )
    .then(function (result) {
      var oAuthClient = result.rows[0];

      if (!oAuthClient) {
        console.log("!getClient");
        return;
      }

      return {
        clientId: oAuthClient.client_id,
        clientSecret: oAuthClient.client_secret,
        grants: ["password", "refresh_token"], // the list of OAuth2 grant types that should be allowed
      };
    });
};

/*
 * Get user.
 */

async function compareAsync(param1, param2) {
  const bcrypt = require("bcrypt");
  return await new Promise(function (resolve, reject) {
    bcrypt.compare(param1, param2, function (err, res) {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
  
}

module.exports.getUser = function* (username, password) {
  console.log("getUser");
  return pg
    .query("SELECT uuid, user_password FROM tb_accounts WHERE user_id = $1", [
      username,
    ])
    .then(async function (result) {
      if(result.rows.length > 0){
        const hashPassword = result.rows[0].user_password;
        const res = await compareAsync(password, hashPassword);
        if (res) {
          let resultData = { id: result.rows[0].uuid };
          return resultData;
        } else {
          let resultData = {message : "Password does not match"}
          return resultData;
        }
      } else {
        let resultData = {message : "User does not exists"}
        return resultData;
      }
    });
};

module.exports.revokeToken = function* (token) {
  console.log("revokeToken");
  return pg
    .query("DELETE FROM oauth_tokens WHERE refresh_token = $1", [
      token.refresh_token,
    ])
    .then(function (refreshToken) {
      console.log(refreshToken);
      return !!refreshToken;
    });
};
