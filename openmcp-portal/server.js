const fs = require("fs"); //database.json파일 접근
const express = require("express");
const OAuthServer = require("express-oauth-server");
const bodyParser = require("body-parser");
const app = express();
const data = fs.readFileSync("./config.json");
const conf = JSON.parse(data);

const util = require("util");
var render = require("co-views")("views");
// var os = require("os");
// var path = require("path");

const isLocal = process.env.api_url === undefined;

if (!isLocal) {
  conf.api.url = process.env.api_url;
  conf.db.user = process.env.db_user;
  conf.db.host = process.env.db_host;
  conf.db.database = process.env.db_database;
  conf.db.password = process.env.db_password;
  conf.db.port = process.env.db_port;
}

const createTableScript = fs
  .readFileSync("./db_script/opencmp_portal_create_table_.sql")
  .toString();
const inertDataScript = fs
  .readFileSync("./db_script/opencmp_portal_insert_data.sql")
  .toString();

const port = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.oauth = new OAuthServer({
  model: require("./model.js"),
  accessTokenLifetime: 4 * 60 * 60,
});

//////////////////////////////////////////////////////////
// 함수
//////////////////////////////////////////////////////////

async function excuteQuery(query) {
  let response;
  try {
    response = await connection.query(query);
    return response.rows;
  } catch (error) {}
}

const groupBy = function (data, key) {
  return data.reduce(function (carry, el) {
    var group = el[key];

    if (carry[group] === undefined) {
      carry[group] = [];
    }

    carry[group].push(el);
    return carry;
  }, {});
};

const convertBytes = function (bytes) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  if (bytes == 0) {
    return "n/a";
  }

  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

  if (i == 0) {
    return bytes + " " + sizes[i];
  }

  return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
};

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
  return date_format_str;
}

function getDateBefore(type, time) {
  var d = new Date();
  d = new Date(d.getTime());
  if (type === "h") {
    d.setHours(d.getHours() - time);
  } else if (type === "m") {
    d.setMinutes(d.getMinutes() - time);
  } else if (type === "d") {
    d.setDate(d.getDate() - time);
  }

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
  return date_format_str;
}
//////////////////////////////////////////////////////////
//  함수끝
//////////////////////////////////////////////////////////

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(app.oauth.authorize());

app.get("/api/hello", (req, res) => {
  res.send({ messge: "Hello Express!" });
});

const apiServer = conf.api.url; //로컬 API 서버

//데이터베이스 접속 설정
const { Client } = require("pg");
const { toNamespacedPath } = require("path");

const connection = new Client({
  user: conf.db.user,
  host: conf.db.host,
  database: conf.db.database,
  password: conf.db.password,
  port: conf.db.port,
});

connection.connect();
dbSettings();

//최초 DB환경설정
function dbSettings() {
  //connection.connect();
  connection.query(`select * from tb_account_role;`, (err, result) => {
    if (result === undefined) {
      connection.query(createTableScript, (err, result) => {
        if (err != null) {
          console.log("table script : ", err);
        }
        connection.query(inertDataScript, (err, result) => {
          if (err != null) {
            console.log("insert script : ", err);
          }
        });
      });
      console.log("DB schemas create");
    } else {
      console.log("Skip DB schemas create");
    }
    //connection.end();
  });
}

/////////////////////////////////////////////////////////////////
// OAuth2.0 서비스
/////////////////////////////////////////////////////////////////
// Post token.
app.post("/oauth/token", app.oauth.token(), function (req, res) {
  // console.log("/oauth/token");
});

// Get authorization.
app.get("/oauth/authorize", function (req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(
      util.format(
        "/login?redirect=%s&client_id=%s&redirect_uri=%s",
        req.path,
        req.query.client_id,
        req.query.redirect_uri
      )
    );
  }

  return render("authorize", {
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
  });
});

// Post authorization.
app.post("/oauth/authorize", function (req, res) {
  // Redirect anonymous users to login page.
  if (!req.app.locals.user) {
    return res.redirect(
      util.format(
        "/login?client_id=%s&redirect_uri=%s",
        req.query.client_id,
        req.query.redirect_uri
      )
    );
  }

  return app.oauth.authorize();
});

// Get login.
app.get("/login", function (req) {
  return render("login", {
    redirect: req.query.redirect,
    client_id: req.query.client_id,
    redirect_uri: req.query.redirect_uri,
  });
});

// Post login.
app.post("/login", function (req, res) {
  // @TODO: Insert your own login mechanism.
  if (req.body.email !== "thom@nightworld.com") {
    return render("login", {
      redirect: req.body.redirect,
      client_id: req.body.client_id,
      redirect_uri: req.body.redirect_uri,
    });
  }

  // Successful logins should send the user back to /oauth/authorize.
  var path = req.body.redirect || "/home";

  return res.redirect(
    util.format(
      "/%s?client_id=%s&redirect_uri=%s",
      path,
      req.query.client_id,
      req.query.redirect_uri
    )
  );
});

// Get secret.
app.get("/secret", app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token.
  res.send("Secret get");
});

app.delete("/secret", app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token.
  res.send("Secret delete");
});

app.post("/secret", app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token.
  res.send("Secret post");
});

app.put("/secret", app.oauth.authenticate(), function (req, res) {
  // Will require a valid access_token.
  res.send("Secret put");
});

app.get("/public", function (req, res) {
  // Does not require an access_token.
  res.send("Public area");
});

/////////////////////////////////////////////////////////////////
// END OAuth2.0 서비스 END
/////////////////////////////////////////////////////////////////

///////////////////////
// Write Log
///////////////////////
app.post("/apimcp/portal-log", (req, res) => {
  const bcrypt = require("bcrypt");
  var created_time = getDateTime();

  //connection.connect();
  connection.query(
    `insert into tb_portal_logs values ('${req.body.userid}','${req.body.code}','${created_time}');`,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Update success",
      };

      if (err !== null) {
        console.log("error", err);
        result_set = {
          data: [],
          message: "Update log failed : " + err,
        };
      }

      res.send(result_set);
      //connection.end();
    }
  );
});

///////////////////////
// Login
///////////////////////

app.post("/user_login", (req, res) => {
  const bcrypt = require("bcrypt");

  let query = `select *, 
  array(
        select distinct array_to_string(clusters,',')
        from tb_group_role t 
        where ta.user_id = ANY(t.member)
        ) as g_clusters
  from tb_accounts ta where ta.user_id = '${req.body.userid}';`;

  connection.query(
    // `select * from tb_accounts where user_id = '${req.body.userid}';`,
    query,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Please check your Password",
      };

      if (result.rows.length < 1) {
        result_set = {
          data: [],
          message: "There is no user, please check your account",
        };
        res.send(result_set);
      } else {
        const hashPassword = result.rows[0].user_password;
        bcrypt.compare(req.body.password, hashPassword).then(function (r) {
          if (r) {
            result_set = {
              data: result,
              message: "Login Successful !!",
            };
          }
          res.send(result_set);
        });
      }
      //connection.end();
    }
  );
});

app.get("/dashboard-master-cluster", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/dashboard_master_cluster.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});

let token = "";
// Projects 리스트 가져오기
app.get("/api/projects", (req, res) => {
  var request = require("request");
  // var url = "http://192.168.0.152:31635/token?username=openmcp&password=keti";
  // var uri ="http://192.168.0.152:31635/api/v1/namespaces/kube-system/pods?clustername=cluster1";

  var options = {
    uri: "http://192.168.0.152:31635/api/v1/namespaces/kube-system/pods?clustername=cluster1",
    method: "GET",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDMxMDQ4NzcsImlhdCI6MTYwMzEwMTI3NywidXNlciI6Im9wZW5tY3AifQ.mgO5hRruyBioZLTJ5a3zwZCkNBD6Bg2T05iZF-eF2RI",
    },
  };

  var options = {
    uri: "http://192.168.0.152:31635/api/v1/namespaces/kube-system/pods?clustername=cluster1",
    method: "GET",
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDMxMDQ4NzcsImlhdCI6MTYwMzEwMTI3NywidXNlciI6Im9wZW5tY3AifQ.mgO5hRruyBioZLTJ5a3zwZCkNBD6Bg2T05iZF-eF2RI",
    },
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    } else {
      console.log("error", error);
    }
  });

  //   request(url, function (error, response, body) {
  //     if (!error && response.statusCode == 200) {
  //
  //         token = body.token;
  //     } else {
  //         return error
  //     }
  //   });

  //connection.connect();
  connection.query("SELECT * FROM PROJECT_LIST", (err, result) => {
    res.send(result.rows);
    //connection.end();
  });
});

///////////////////////
// Projects APIs
///////////////////////

// Prjects
app.post("/projects", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);

  var options = {
    uri: `${apiServer}/apis/projects`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > overview
app.get("/projects/:project/overview", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_overview.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > create
app.post("/projects/create", (req, res) => {
  requestData = {
    project: req.body.project,
    clusters: req.body.clusters,
  };

  var data = JSON.stringify(requestData);
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/projects/create`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// // Prjects > get Clusters Names
// app.get("/clusters/name", (req, res) => {
//   let rawdata = fs.readFileSync(
//     "./json_data/clusters_name.json"
//   );
//   let overview = JSON.parse(rawdata);
//   //console.log(overview);
//   res.send(overview);
// });

// Prjects > Resources > Workloads > Deployments
app.get("/projects/:project/resources/workloads/deployments", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_deployments.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.params.project}/deployments`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Workloads > Deployments > detail
app.get(
  "/projects/:project/resources/workloads/deployments/:deployment",
  (req, res) => {
    // let rawdata = fs.readFileSync(
    //   "./json_data/projects_deployment_detail.json"
    // );
    // let overview = JSON.parse(rawdata);
    // // //console.log(overview);
    // res.send(overview);

    var request = require("request");
    var options = {
      uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.params.project}/deployments/${req.params.deployment}`,
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      } else {
        console.log("error", error);
      }
    });
  }
);

// Prjects > Resources > Workloads > Deployments > detail > replica status
app.get(
  "/projects/:project/resources/workloads/deployments/:deployment/replica_status",
  (req, res) => {
    var request = require("request");
    var options = {
      uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.params.project}/deployments/${req.params.deployment}/replica_status`,
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      } else {
        console.log("error", error);
      }
    });

    // //connection.connect();
    //connection.query(
    //   "select * from tb_replica_status order by cluster asc, created_time desc, status desc",
    //   (err, result) => {
    //     var result2 = result.rows.reduce(
    //       (obj, { cluster, status, pod, created_time }, index) => {
    //         if (!obj[cluster]) {
    //           obj[cluster] = { cluster: cluster, pods: [] };
    //         }

    //         obj[cluster].pods.push({
    //           status: status,
    //           name: pod,
    //           created_time: created_time,
    //         });
    //         return obj;
    //       },
    //       {}
    //     );

    //     var arr = [];
    //     for (i = 0; i < Object.keys(result2).length; i++) {
    //       arr.push(result2[Object.keys(result2)[i]]);
    //     }

    //     res.send(arr);
    //   }
    // );
    // let rawdata = fs.readFileSync("./json_data/projects_deployment_detail.json");
    // let overview = JSON.parse(rawdata);
    // //console.log(overview);
    // res.send(overview);
  }
);

app.post("/apis/deployments/replica_status/set_pod_num", (req, res) => {
  var data = JSON.stringify(req.body);
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/deployments/replica_status/set_pod_num`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Deployments 상세부터 구현해나가야 함
// Prjects > Resources > Workloads > Statefulsets
app.get("/projects/:project/resources/workloads/statefulsets", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_statefulsets.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.params.project}/statefulsets`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get(
  "/projects/:project/resources/workloads/statefulsets/:statefulset",
  (req, res) => {
    // let rawdata = fs.readFileSync("./json_data/projects_statefulsets.json");
    // let overview = JSON.parse(rawdata);
    // //console.log(overview);
    // res.send(overview);

    var request = require("request");
    var options = {
      uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.params.project}/statefulsets/${req.params.statefulset}`,
      method: "GET",
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      } else {
        console.log("error", error);
      }
    });
  }
);

// Prjects > Resources > pods
app.get("/projects/:project/resources/pods", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_pods.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/pods`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Pods Detail
app.get("/projects/:project/resources/pods/:pod", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_pod_detail.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/pods/${req.params.pod}?cluster=${req.query.cluster}&project=${req.query.project}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Services
app.get("/projects/:project/resources/services", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_services.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/services`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Services Detail
app.get("/projects/:project/resources/services/:service", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_service_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/services/${req.params.service}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Ingress
app.get("/projects/:project/resources/ingress", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_ingress.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/ingress`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Ingress Detail
app.get("/projects/:project/resources/ingress/:ingress", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_ingress_detail.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/ingress/${req.params.ingress}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > volumes
app.get("/projects/:project/volumes", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_volumes.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/volumes`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > volumes Detail
app.get("/projects/:project/volumes/:volume", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_volume_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/volumes/${req.params.volume}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Config > Secrets
app.get("/projects/:project/config/secrets", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_secrets.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/secrets`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Config > Secrets Detail
app.get("/projects/:project/config/secrets/:secret", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_secret_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/secrets/${req.params.secret}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Config > ConfigMaps
app.get("/projects/:project/config/config_maps", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_config_maps.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/configmaps`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Config > ConfigMaps Detail
app.get("/projects/:project/config/config_maps/:config_map", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_config_map_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${req.query.cluster}/projects/${req.params.project}/configmaps/${req.params.config_map}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Settings > Members
app.get("/projects/:project/settings/members", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/projects_members.json");
  let overview = JSON.parse(rawdata);
  //console.log(overview);
  res.send(overview);
});

//////////////////////////
// Deployments
/////////////////////////

// Deployments
app.post("/deployments", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/projects_deployments.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/deployments`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/deployments/:deployment", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/deployment_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clsuters/${req.query.cluster}/projects/${req.query.project}/deployments/${req.params.deployment}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/deployments/omcp-deployment/:deployment", (req, res) => {

  let clusters = [];
  let cluster = req.query.cluster;
  cluster.split(" ").forEach(item => {
    clusters.push(item.split(':')[0]);
  });

  let data = {
    deployClusters : clusters
  };

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clsuters/openmcp/projects/${req.query.project}/deployments/omcp-deployment/${req.params.deployment}`,
    method: "POST",
    body: JSON.stringify(data)
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get(
  "/projects/:project/resources/workloads/deployments/omcp-deployment/:deployment/replica_status",
  (req, res) => {
    var request = require("request");

    var options = {
      uri: `${apiServer}/apis/clsuters/openmcp/projects/${req.query.project}/deployments/omcp-deployment/${req.params.deployment}/replica_status`,
      method: "GET"
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        res.send(body);
      } else {
        console.log("error", error);
      }
    });
  }
);




app.post("/deployments/create", (req, res) => {
  const YAML = req.body.yaml;
  const data = {
    cluster : req.body.cluster,
    yaml : YAML
  }
  
  var options = {
    uri: `${apiServer}/apis/deployments/create`,
    method: "POST",
    body: JSON.stringify(data),
    // body: YAML
  };
  
  var request = require("request");
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/deployments/delete", (req, res) => {
  const data = {
    cluster : req.body.cluster,
    namespace : req.body.namespace,
    deployment : req.body.deployment,
    ynOmcpDp : req.body.ynOmcpDp
  }
  
  var options = {
    uri: `${apiServer}/apis/deployments/delete`,
    method: "POST",
    body: JSON.stringify(data),
    // body: YAML
  };
  
  var request = require("request");
  request(options, function (error, response, body) {
    console.log("response : ",response.statusCode);
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/deployments/resources", (req, res) => {
  var request = require("request");
  var data = JSON.stringify(req.body);

  var options = {
    uri: `${apiServer}/apis/deployments/resources`,
    method: "POST",
    body: data,
  };
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

///////////////////////
// Clusters APIs
///////////////////////
// app.get("/clusters", app.oauth.authenticate(), (req, res) => {
app.post("/clusters", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/clusters.json");
  // let rawdata = fs.readFileSync("./json_data/clusters2_warning.json");
  // let rawdata = fs.readFileSync("./json_data/clusters3-1_normal.json");
  // let rawdata = fs.readFileSync("./json_data/clusters3-1_50.json");
  // let rawdata = fs.readFileSync("./json_data/clusters3-1_70.json");
  // let rawdata = fs.readFileSync("./json_data/clusters3-1_80.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/clusters`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/clusters-joinable", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/clusters_joinable.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/joinableclusters`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Clusters > overview
app.get("/clusters/:cluster/overview", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/clusters_overview.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/overview?clustername=${req.params.cluster}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Clusters joinable > overview
app.get("/clusters-joinable/:cluster/overview", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/clusters_joinable_overview.json");
  let overview = JSON.parse(rawdata);
  //console.log(overview);
  res.send(overview);
});

// Clusters > nodes
app.get("/clusters/:cluster/nodes", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/clusters_nodes.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  const clusterName = req.params.cluster;
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${clusterName}/nodes`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Clusters > nodes > detail ///// not use
// app.get("/clusters/:cluster/nodes/:node", (req, res) => {
//   let rawdata = fs.readFileSync("./json_data/clusters_node_detail.json");
//   let overview = JSON.parse(rawdata);
//   //console.log(overview);
//   res.send(overview);
// });

// Clusters > pods
app.get("/clusters/:cluster/pods", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/clusters_pods.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);

  const clusterName = req.params.cluster;
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/clusters/${clusterName}/pods`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Clusters > pods > detail
app.get("/clusters/:cluster/pods/:pod", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/clusters_pod_detail.json");
  let overview = JSON.parse(rawdata);
  //console.log(overview);
  res.send(overview);
});

// Clusters > Storage Class
app.get("/clusters/:cluster/storage_class", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/clusters_storage_class.json");
  let overview = JSON.parse(rawdata);
  //console.log(overview);
  res.send(overview);
});

// Clusters > Storage Class > detail
app.get("/clusters/:cluster/storage_class/:storage_class", (req, res) => {
  let rawdata = fs.readFileSync(
    "./json_data/clusters_storage_class_detail.json"
  );
  let overview = JSON.parse(rawdata);
  //console.log(overview);
  res.send(overview);
});

// cluster > join
app.post("/cluster/join", (req, res) => {
  requestData = {
    clusterName: req.body.clusterName,
    clusterAddress: req.body.clusterAddress,
  };

  var data = JSON.stringify(requestData);
  var request = require("request");
  var options = {
    // https://192.168.0.152:30000/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/cluster2?clustername=openmcp
    uri: `${apiServer}/apis/clusters/join`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// cluster > unjoin
app.post("/cluster/unjoin", (req, res) => {
  requestData = {
    clusterName: req.body.clusterName,
  };

  var data = JSON.stringify(requestData);
  var request = require("request");
  var options = {
    // https://192.168.0.152:30000/apis/openmcp.k8s.io/v1alpha1/namespaces/openmcp/openmcpclusters/cluster2?clustername=openmcp
    uri: `${apiServer}/apis/clusters/unjoin`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

/////////////
// Nodes
/////////////
app.post("/nodes", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/nodes.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);

  var options = {
    uri: `${apiServer}/apis/nodes`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/apis/metric/apiServer", async (req, res) => {
  var date = getDateTime();
  var dateBefore = getDateBefore("h", 1);
  let resultData = [];

  let query = `SELECT *
  FROM apiserver_state
  where reqests_per_sec <> '' and latency <> '' 
  and cluster_name = '${req.query.cluster}' 
  and collected_time >= '${dateBefore}' 
  and collected_time < '${date}'
  order by collected_time desc;
  `;

  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    var data = {};
    queryResult.forEach((item) => {
      data = {
        unit: "sec",
        requests_per_sec: parseFloat(item.reqests_per_sec).toFixed(2),
        latency: parseFloat(item.latency).toFixed(2),
        time: item.collected_time,
      };
      resultData.push(data);
    });
  }
  res.send(resultData);
});

// app.get("/azure/aks-type", (req, res) => {
//   connection.query(
//     `select * from tb_codes where kinds='AKS-TYPE' order by etc;`,
//     (err, result) => {
//       res.send(result.rows);
//     }
//   );
// });

//node resource 예측
app.get("/nodes/predict", (req, res) => {
  let query = `SELECT
    TRIM(cluster) as cluster,
    TRIM(node) as node,
    cpu/1000/1000/1000 cpu,
    memory/1000/1000 memory,
    collected_time
  FROM node_workload_prediction nwp
  WHERE (cluster, node, collected_time) IN
    (select cluster, node, MAX(collected_time) as max_date
    from node_workload_prediction
    group by cluster, node)
  ORDER BY cluster;
  `;

  connection.query(query, (err, result) => {
    res.send(result.rows);
    // var result_set = {
    //   data: [],
    //   message: "Failed get nodes resource predict data",
    // };

    // if (result.rows.length < 1) {
    //   result_set = {
    //     data: [],
    //     message: "There is no predict data",
    //   };
    //   res.send(result_set);
    // } else {
    //   result.

    //   res.send(result.rows);
    // }
    //connection.end();
  });
});

//asdasd
app.post("/nodes/add/eks", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_eks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the EKS Auth Informations.\n
          Settings > Config > Public cloud Auth > EKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        region: req.body.region,
        cluster: req.body.cluster,
        nodePool: req.body.nodePool,
        desiredCnt: req.body.desiredCnt,
        accessKey: result.rows[0].accessKey,
        secretKey: result.rows[0].secretKey,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        // uri: `${apiServer}/apis/addeksnode`,
        uri: `${apiServer}/apis/changeeksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/add/aks", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_aks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        cluster: req.body.cluster,
        desiredCnt: req.body.desiredCnt,
        nodePool: req.body.nodePool,
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/addaksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/add/gke", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_gke
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the GKE Auth Informations.\n
          Settings > Config > Public cloud Auth > GKE`,
        };
        return res.send(result_set);
      }

      requestData = {
        projectId: result.rows[0].projectID,
        clientEmail: result.rows[0].clientEmail,
        privateKey: result.rows[0].privateKey,
        cluster: req.body.cluster,
        nodePool: req.body.nodePool,
        desiredCnt: req.body.desiredCnt,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/gkechangenodecount`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/add/kvm", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_kvm
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the KVM Auth Informations.\n
          Settings > Config > Public cloud Auth > KVM`,
        };
        return res.send(result_set);
      }

      requestData = {
        agentURL: result.rows[0].agentURL,
        master: result.rows[0].mClusterName,
        mpass: result.rows[0].mClusterPwd,
        newvm: req.body.newvm,
        template: req.body.template,
        wpass: req.body.newVmPassword,
        cluster: req.body.cluster,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/createkvmnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/delete/kvm", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_kvm
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the KVM Auth Informations.\n
          Settings > Config > Public cloud Auth > KVM`,
        };
        return res.send(result_set);
      }

      requestData = {
        agentURL: result.rows[0].agentURL,
        targetvm: req.body.node,
        mastervm: result.rows[0].mClusterName,
        mastervmpwd: result.rows[0].mClusterPwd,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/deletekvmnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
    }
  );
});

//////////////////
// Nodes > datail
//////////////////
app.get("/nodes/:node", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/nodes_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/nodes/${req.params.node}?clustername=${req.query.clustername}&provider=${req.query.provider}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.patch("/apis/nodes/taint/add", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/nodes_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let requestData = {
    clusterName :req.body.clusterName,
    nodeName :req.body.nodeName,
    effect :req.body.effect,
    key :req.body.key,
    value: req.body.value,
  };

  let data = JSON.stringify(requestData);

  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/nodes/taint/add`,
    method: "PATCH",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});


app.patch("/apis/nodes/taint/delete", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/nodes_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let requestData = {
    clusterName :req.body.clusterName,
    nodeName :req.body.nodeName,
    index: req.body.index,
  };

  let data = JSON.stringify(requestData);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/nodes/taint/delete`,
    method: "PATCH",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});




app.get("/nodes/:node/power-usage", async (req, res) => {
  

  let resultData = {
    range: [],
    rows: [],
    timeline:[],
  };
  let totalRange = 0;

  let query = `select CASE WHEN code = 'POWER-LOW' THEN 'low'
                WHEN code = 'POWER-MEDIUM' THEN 'medium'
                ELSE 'high' END as name, description as value from tb_codes
              where kinds = 'CONFIG'
              and code like 'POWER%'
              order by code desc;
    `;
  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let low = 0;
    let medium = 0;
    let high = 0;
    queryResult.forEach((item) => {
      if (item.name === "high") {
        totalRange = item.value;
        high = item.value;
      } else if (item.name === "medium") {
        medium = item.value;
      } else {
        low = item.value;
      }
    });
    resultData.range = [
      { name: "low", value: parseFloat(low) },
      { name: "medium", value: medium - low },
      { name: "high", value: high - medium },
    ];
  }

  query = `select power as usage
  from node_power_usage
  where (cluster_name, node_name, collected_time) in (
  select cluster_name, node_name,max(collected_time)as max_date
  from node_power_usage
  where cluster_name='${req.query.clustername}' and node_name= '${req.params.node}'
  group by cluster_name, node_name);
  `;

  // let query = `select trim(cluster_name) cluster_name, trim(node_name) node_name, power, collected_time
  // from node_power_usage
  // where (cluster_name, node_name, collected_time) in (
  // select cluster_name, node_name,max(collected_time)as max_date
  // from node_power_usage
  // where cluster_name='${req.query.clustername}' and node_name= '${req.params.node}'
  // group by cluster_name, node_name);
  // `;

  let queryResult2 = await excuteQuery(query);
  if (queryResult2.length > 0) {
    let data = queryResult2[0];
    let usage = parseFloat(parseFloat(data.usage).toFixed(1));
    // console.log("usage : ", data.usage);
    if (data.usage === null) {
      usage = 0;
    }
    resultData.rows.push({
      name: "usage",
      value: usage,
    });

    resultData.rows.push({
      name: "available",
      value: totalRange - usage,
    });
  }

  query = `select power, collected_time
  from node_power_usage
  where cluster_name='${req.query.clustername}' and node_name= '${req.params.node}';
  `;


  let queryResult3 = await excuteQuery(query);
  if (queryResult3.length > 0) {
    let data = queryResult3;
    queryResult3.forEach((item) => {
      resultData.timeline.push({
        usage: parseFloat(parseFloat(item.power).toFixed(2)),
        time: item.collected_time,
      });
    });
  }
  res.send(resultData);
});

app.post("/nodes/eks/start", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_eks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the EKS Auth Informations.\n
          Settings > Config > Public cloud Auth > EKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        akid: result.rows[0].accessKey,
        secretKey: result.rows[0].secretKey,
        region: req.body.region,
        node: req.body.node,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/starteksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/eks/stop", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_eks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the EKS Auth Informations.\n
          Settings > Config > Public cloud Auth > EKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        akid: result.rows[0].accessKey,
        secretKey: result.rows[0].secretKey,
        region: req.body.region,
        node: req.body.node,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/stopeksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/eks/change", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_eks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the EKS Auth Informations.\n
          Settings > Config > Public cloud Auth > EKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        akid: result.rows[0].accessKey,
        secretKey: result.rows[0].secretKey,
        region: result.rows[0].region,
        type: req.body.type,
        node: req.body.node,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/changeekstype`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/aks/start", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_aks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        cluster: req.body.cluster,
        node: req.body.node,
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/startaksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/aks/stop", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_aks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        cluster: req.body.cluster,
        node: req.body.node,
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/stopaksnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/clusters/aks/change", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_aks
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
        cluster: req.body.cluster,
        poolName: req.body.poolName,
        skuTierStr: req.body.tier,
        skuNameStr: req.body.type,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/akschangevmss`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/kvm/stop", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_kvm
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the KVM Auth Informations.\n
          Settings > Config > Public cloud Auth > KVM`,
        };
        return res.send(result_set);
      }

      requestData = {
        node: req.body.node,
        agentURL: result.rows[0].agentURL,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/stopkvmnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/kvm/start", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_kvm
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the KVM Auth Informations.\n
          Settings > Config > Public cloud Auth > KVM`,
        };
        return res.send(result_set);
      }

      requestData = {
        node: req.body.node,
        agentURL: result.rows[0].agentURL,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/startkvmnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/nodes/kvm/change", (req, res) => {
  //connection.connect();
  connection.query(
    `select * 
     from tb_config_kvm
     where cluster='${req.body.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the KVM Auth Informations.\n
          Settings > Config > Public cloud Auth > KVM`,
        };
        return res.send(result_set);
      }

      requestData = {
        agentURL: result.rows[0].agentURL,
        node: req.body.node,
        cpu: req.body.cpu,
        memory: req.body.memory,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/changekvmnode`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          res.send(body);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

/////////////////////////
// Public Cloud Cluster
//////////////////////////
app.get("/aws/eks-type", (req, res) => {
  //connection.connect();
  connection.query(
    `select * from tb_codes where kinds='EKS-TYPE' order by etc;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.get("/azure/aks-type", (req, res) => {
  //connection.connect();
  connection.query(
    `select * from tb_codes where kinds='AKS-TYPE' order by etc;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.get("/azure/pool/:cluster", (req, res) => {
  var cluster = req.params.cluster;
  connection.query(
    `select * 
     from tb_config_aks
     where cluster='${req.params.cluster}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
      };

      var data = JSON.stringify(requestData);
      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/aksgetallres`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var clusterInfo = {};

          for (let value of JSON.parse(body)) {
            // if(value.name == cluster){ //임시로 막음(일치하는 클러스터가 없음)
            if (value.name === "aks-cluster-01") {
              //임시로 하드코딩함
              clusterInfo = value;
            }
          }
          res.send(clusterInfo);
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.post("/clusters/public-cloud", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_clusters.json");
  // let overview = JSON.parse(rawdata);
  // //console.log(overview);
  // res.send(overview);

  console.log("ddddd")
  var request = require("request");
  let data = JSON.stringify(req.body);

  var options = {
    uri: `${apiServer}/apis/clusters/public-cloud`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.get("/eks/clusters/workers", (req, res) => {
  var clusterName = req.query.clustername;
  // let rawdata = fs.readFileSync("./json_data/eks_workers.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_eks
     where cluster='${clusterName}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the EKS Auth Informations.\n
          Settings > Config > Public cloud Auth > EKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        region: result.rows[0].region,
        accessKey: result.rows[0].accessKey,
        secretKey: result.rows[0].secretKey,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        // uri: `${apiServer}/apis/addeksnode`,
        uri: `${apiServer}/apis/geteksclusterinfo`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          
          result.map((item) => {
            if (item.name == clusterName) {
              res.send(item.nodegroups);
            }
          });
        } else {
          console.log("error", error);
          res.send(error);
          //
        }
      });
      //connection.end();
    }
  );
});

app.get("/gke/clusters", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/gke_clusters.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});

app.get("/gke/clusters/pools", (req, res) => {
  var clusterName = req.query.clustername;
  // let rawdata = fs.readFileSync("./json_data/gke_node_pools.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    `select * 
     from tb_config_gke
     where cluster='${clusterName}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the GKE Auth Informations.\n
          Settings > Config > Public cloud Auth > GKE`,
        };
        return res.send(result_set);
      }

      requestData = {
        projectId: result.rows[0].projectID,
        clientEmail: result.rows[0].clientEmail,
        privateKey: result.rows[0].privateKey,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/getgkeclusters`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          result.map((item) => {
            if (item.clusterName == clusterName) {
              res.send(item.nodePools);
            }
          });
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.get("/aks/clusters", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/aks_clusters.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});

app.get("/aks/clusters/pools", (req, res) => {
  var clusterName = req.query.clustername;
  // let rawdata = fs.readFileSync("./json_data/aks_node_pools.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,accessKey,secretKey
    `select * 
     from tb_config_aks
     where cluster='${clusterName}';`,
    (err, result) => {
      if (result.rows.length === 0) {
        const result_set = {
          error: true,
          message: `Auth Information does not Exist.\nPlease Enter the AKS Auth Informations.\n
          Settings > Config > Public cloud Auth > AKS`,
        };
        return res.send(result_set);
      }

      requestData = {
        clientId: result.rows[0].clientId,
        clientSec: result.rows[0].clientSec,
        tenantId: result.rows[0].tenantId,
        subId: result.rows[0].subId,
      };

      var data = JSON.stringify(requestData);

      var request = require("request");
      var options = {
        uri: `${apiServer}/apis/aksgetallres`,
        method: "POST",
        body: data,
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var result = JSON.parse(body);
          result.map((item) => {
            if (item.name == clusterName) {
              res.send(item.agentpools);
            }
          });
        } else {
          console.log("error", error);
        }
      });
      //connection.end();
    }
  );
});

app.get("/kvm/clusters", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/kvm_clusters.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});

//////////////////////////
// Pods
/////////////////////////

// Pods
app.post("/pods", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/pods.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/pods`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Pods > detail
app.get("/pods/:pod", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/pods_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/pods/${req.params.pod}?cluster=${req.query.cluster}&project=${req.query.project}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/pods/:pod/physicalResPerMin", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/pods_detail.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/pods/${req.params.pod}/physicalResPerMin?cluster=${req.query.cluster}&project=${req.query.project}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/hpa", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/hpa.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/hpa`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/vpa", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/vpa.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/vpa`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

////////////////////////
// Ingress
////////////////////////

// Prjects > Resources > Ingress
app.post("/ingress", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/ingress.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);

  var options = {
    uri: `${apiServer}/apis/ingress`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Prjects > Resources > Ingress Detail
app.get("/ingress/:ingress", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/ingress_detail.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});

////////////////////////
// Services
////////////////////////

// Services
app.post("/services", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/services.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  let data = JSON.stringify(req.body);
  var options = {
    uri: `${apiServer}/apis/services`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Services Detail
// app.get("/services/:service", (req, res) => {
//   let rawdata = fs.readFileSync("./json_data/service_detail.json");
//   let overview = JSON.parse(rawdata);
//   res.send(overview);
// });

app.delete("/api/services/delete", (req, res) => {
  var request = require("request");
  let requestData = {
    serviceData: req.body.serviceData,
  };

  var data = JSON.stringify(requestData);

  var options = {
    uri: `${apiServer}/apis/services/delete`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });

});
////////////////////////
// Network > DNS
////////////////////////

// DNS > Services
app.get("/dns", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/dns.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/dns`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// DNS > Detail
app.get("/dns/:dns", (req, res) => {
  let rawdata = fs.readFileSync("./json_data/dns_detail.json");
  let overview = JSON.parse(rawdata);
  res.send(overview);
});


////////////////////////
// Network > Load Balancer
////////////////////////
app.get("/apis/network/loadbalancer", (req, res) => {
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/getkialiurl?clusterName=${req.query.clusterName}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

///////////////////////
//Settings > Accounts
///////////////////////
app.get("/settings/accounts", (req, res) => {
  //connection.connect();
  connection.query(
    `select
  user_id, 
  role_id,
  array(
      select role_name 
      from tb_account_role t 
      where t.role_id = ANY(u.role_id)
      ) as role,
  last_login_time,
  created_time
  from tb_accounts u`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.get("/settings/accounts/userLog", (req, res) => {
  //connection.connect();
  connection.query(
    `SELECT
    pl.user_id,
    pl.code,
    cd.description,
    cd.etc,
    pl.created_time
    FROM tb_portal_logs pl
    LEFT OUTER JOIN tb_codes cd ON pl.code = cd.code
    ORDER BY pl.created_time DESC
    `,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/create_account", (req, res) => {
  const bcrypt = require("bcrypt");
  const saltRounds = 10;
  var password = "";

  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(req.body.password, salt, function (err, hash_password) {
      var create_time = getDateTime();
      //connection.connect();
      connection.query(
        `insert into tb_accounts values ('${req.body.userid}', '${hash_password}','${req.body.role}','${create_time}','${create_time}');`,
        (err, result) => {
          if (err !== "null") {
            const result_set = {
              data: [],
              message: "Account creation was successful !!",
            };
            res.send(result_set);
            //connection.end();
          } else {
            const result_set = {
              data: [],
              message: "Account creation was faild, please check account",
            };
            res.send(result_set);
          }
          //connection.end();
        }
      );
    });
  });
});

app.get("/account-roles", (req, res) => {
  //connection.connect();
  connection.query(`select * from tb_account_role;`, (err, result) => {
    // var result_set = {
    //   data: [],
    //   message: "Update success",
    // };

    // if (err !== "null") {
    //   console.log(err)
    //   const result_set = {
    //     data: [],
    //     message: "Update log failed : " + err,
    //   };
    // }
    res.send(result.rows);
    //connection.end();
  });
});

app.put("/update/account-roles", (req, res) => {
  //connection.connect();
  connection.query(
    `update tb_accounts set role_id = '{"${req.body.role}"}' where user_id = '${req.body.userid}';`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Update was successful !!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Update was faild, please check account : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );

  // bcrypt.genSalt(saltRounds, function (err, salt) {
  //   bcrypt.hash(req.body.password, salt, function (err, hash_password) {
  //     var create_time = getDateTime();

  //   });
  // });
});

//////////////////////////
// Settings > Groups Role
//////////////////////////
app.get("/settings/group-role", (req, res) => {
  // //connection.connect();
  //connection.query(`select
  // ga.group_id,
  // ga.group_name,
  // array(select role_name
  //   from tb_account_role t
  //   where t.role_id = ANY(ga.role_id)) as role,
  //   projects,
  // ga.description,
  // ga.member
  // from tb_group_role ga
  // order by group_id`, (err, result) => {
  //   res.send(result.rows);
  // });
  //connection.connect();
  connection.query(
    `select
  ga.group_id,
  ga.group_name,
  ga.clusters,
  ga.description,
  ga.member
  from tb_group_role ga
  order by group_id`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/group-role", (req, res) => {
  let query = `
  INSERT INTO tb_group_role (group_name, description, member, clusters)
  VALUES ('${req.body.groupName}', '${req.body.description}', '{${req.body.user_id}}', '{${req.body.clusters}}')
  `;
  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Group role is saved !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Save was faild, please check policy : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.put("/settings/group-role", (req, res) => {
  let query = `update tb_group_role 
      set group_name='${req.body.groupName}', 
          description='${req.body.description}',
          member='{${req.body.user_id}}',
          clusters = '{${req.body.clusters}}'
      where group_id = ${req.body.group_id}`;
  // let query =  `update tb_group_role
  //     set group_name='${req.body.groupName}',
  //         description='${req.body.description}',
  //         role_id='{${req.body.role_id}}',
  //         member='{${req.body.user_id}}',
  //         projects = '{${req.body.projects}}'
  //     where group_id = ${req.body.group_id}`

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Group role is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check policy : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.delete("/settings/group-role", (req, res) => {
  let query = `delete from tb_group_role 
  where "group_id" = ${req.body.group_id};`;
  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Delete was successful!!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Delete was faild, please check error : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

//////////////////////////
// Settings > Policy
//////////////////////////
app.get("/settings/policy/openmcp-policy", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/settings_policy.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  // let sql =`select  policy_id, policy_name,
  //                   rate, period
  //           from tb_policy`

  // //connection.connect();
  //connection.query(sql, (err, result) => {
  //   res.send(result.rows);
  // });
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/policy/openmcp`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/settings/policy/openmcp-policy", (req, res) => {
  requestData = {
    policyName: req.body.policyName,
    values: req.body.values,
  };

  var data = JSON.stringify(requestData);
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/policy/openmcp/edit`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/settings/policy/project-policy", (req, res) => {
  let sql = `select  project, cluster, cls_cpu_trh_r, cls_mem_trh_r,
            pod_cpu_trh_r, pod_mem_trh_r, updated_time
            from tb_policy_projects`;

  //connection.connect();
  connection.query(sql, (err, result) => {
    res.send(result.rows);
    //connection.end();
  });
});

app.put("/settings/policy/project-policy", (req, res) => {
  var updated_time = getDateTime();

  let sql = `
  INSERT INTO tb_policy_projects (project, cluster, cls_cpu_trh_r, cls_mem_trh_r, pod_cpu_trh_r, pod_mem_trh_r, updated_time)
  VALUES ('${req.body.project}', '${req.body.cluster}', ${req.body.cls_cpu_trh_r}, ${req.body.cls_mem_trh_r}, ${req.body.pod_cpu_trh_r}, ${req.body.pod_mem_trh_r}, '${updated_time}')
  ON CONFLICT (project, cluster) DO
  UPDATE 
    SET project='${req.body.project}',
    cluster='${req.body.cluster}',
    cls_cpu_trh_r=${req.body.cls_cpu_trh_r},
    cls_mem_trh_r=${req.body.cls_mem_trh_r},
    pod_cpu_trh_r=${req.body.pod_cpu_trh_r},
    pod_mem_trh_r=${req.body.pod_mem_trh_r},
    updated_time='${updated_time}'
  `;
  //connection.connect();
  connection.query(sql, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Update was successful !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check data : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

// Settings > Config > Public Cloud Auth
app.get("/settings/config/pca/eks", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,type,accessKey,secretKey
    `select * from tb_config_eks;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/config/pca/eks", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  //connection.connect();
  connection.query(
    `insert into tb_config_eks (cluster,"accessKey","secretKey","region") values ('${req.body.cluster}','${req.body.accessKey}','${req.body.secretKey}','${req.body.region}');`,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Insert success",
      };

      if (err !== null) {
        console.log("error",err);
        result_set = {
          data: [],
          message: "Insert log failed : " + err,
        };
      }

      res.send(result_set);
      //connection.end();
    }
  );
});

app.put("/settings/config/pca/eks", (req, res) => {
  //connection.connect();
  connection.query(
    `update tb_config_eks set 
      "cluster" = '${req.body.cluster}',
      "accessKey" = '${req.body.accessKey}',
      "secretKey" = '${req.body.secretKey}',
      "region" = '${req.body.region}'
    where seq = ${req.body.seq};`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Update was successful !!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Update was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.delete("/settings/config/pca/eks", (req, res) => {
  //connection.connect();
  connection.query(
    `delete from tb_config_eks 
      where "seq" = '${req.body.seq}' and
            "cluster" = '${req.body.cluster}'`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Delete was successful!!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Delete was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.get("/settings/config/pca/gke", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,type,accessKey,secretKey
    `select * from tb_config_gke;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/config/pca/gke", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  //connection.connect();
  connection.query(
    `insert into tb_config_gke (cluster,"type","clientEmail","projectID","privateKey") values ('${req.body.cluster}','${req.body.type}','${req.body.clientEmail}','${req.body.projectID}','${req.body.privateKey}');`,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Insert success",
      };

      if (err !== null) {
        console.log("error",err);
        result_set = {
          data: [],
          message: "Insert log failed : " + err,
        };
      }

      res.send(result_set);
      //connection.end();
    }
  );
});

app.put("/settings/config/pca/gke", (req, res) => {
  //connection.connect();
  connection.query(
    `update tb_config_gke set 
      "cluster" = '${req.body.cluster}',
      "type" = '${req.body.type}',
      "clientEmail" = '${req.body.clientEmail}',
      "projectID" = '${req.body.projectID}',
      "privateKey" = '${req.body.privateKey}'
    where seq = ${req.body.seq};`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Update was successful !!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Update was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.delete("/settings/config/pca/gke", (req, res) => {
  //connection.connect();
  connection.query(
    `delete from tb_config_gke 
      where "seq" = '${req.body.seq}' and
            "cluster" = '${req.body.cluster}'`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Delete was successful!!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Delete was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

// tb_auth_aks > seq,cluster,clientId,clientSec,tenantId,subId
app.get("/settings/config/pca/aks", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  //connection.connect();
  connection.query(
    // tb_auth_eks > seq,cluster,type,accessKey,secretKey
    `select * from tb_config_aks;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/config/pca/aks", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  //connection.connect();
  connection.query(
    `insert into tb_config_aks (cluster,"clientId","clientSec","tenantId","subId") values ('${req.body.cluster}','${req.body.clientId}','${req.body.clientSec}','${req.body.tenantId}','${req.body.subId}');`,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Insert success",
      };

      if (err !== null) {
        console.log("error",err);
        result_set = {
          data: [],
          message: "Insert log failed : " + err,
        };
      }

      res.send(result_set);
      //connection.end();
    }
  );
});

app.put("/settings/config/pca/aks", (req, res) => {
  //connection.connect();
  connection.query(
    `update tb_config_aks set 
      "cluster" = '${req.body.cluster}',
      "clientId" = '${req.body.clientId}',
      "clientSec" = '${req.body.clientSec}',
      "tenantId" = '${req.body.tenantId}',
      "subId" = '${req.body.subId}'
    where seq = ${req.body.seq};`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Update was successful !!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Update was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.delete("/settings/config/pca/aks", (req, res) => {
  //connection.connect();
  connection.query(
    `delete from tb_config_aks
      where "seq" = '${req.body.seq}' and
            "cluster" = '${req.body.cluster}'`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Delete was successful!!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Delete was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.get("/settings/config/pca/kvm", (req, res) => {
  //connection.connect();
  connection.query(
    // tb_auth_kvm > seq,cluster,
    `select * from tb_config_kvm;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/config/pca/kvm", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/eks_auth.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  //connection.connect();
  connection.query(
    `insert into tb_config_kvm (cluster,"agentURL","agentPort","mClusterName","mClusterPwd") values ('${req.body.cluster}','${req.body.agentURL}','${req.body.agentPort}','${req.body.mClusterName}','${req.body.mClusterPwd}');`,
    (err, result) => {
      var result_set = {
        data: [],
        message: "Insert success",
      };

      if (err !== null) {
        console.log("error",err);
        result_set = {
          data: [],
          message: "Insert log failed : " + err,
        };
      }

      res.send(result_set);
      //connection.end();
    }
  );
});

app.put("/settings/config/pca/kvm", (req, res) => {
  //connection.connect();
  connection.query(
    `update tb_config_kvm set 
      "cluster" = '${req.body.cluster}',
      "agentURL" = '${req.body.agentURL}',
      "agentPort" = '${req.body.agentPort}',
      "mClusterName" = '${req.body.mClusterName}',
      "mClusterPwd" = '${req.body.mClusterPwd}'
    where seq = ${req.body.seq};`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Update was successful !!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Update was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

app.delete("/settings/config/pca/kvm", (req, res) => {
  //connection.connect();
  connection.query(
    `delete from tb_config_kvm 
      where "seq" = '${req.body.seq}' and
            "cluster" = '${req.body.cluster}'`,
    (err, result) => {
      if (err !== "null") {
        const result_set = {
          data: [],
          message: "Delete was successful!!",
        };
        res.send(result_set);
      } else {
        const result_set = {
          data: [],
          message: "Delete was faild, please check error : " + err,
        };
        res.send(result_set);
      }
      //connection.end();
    }
  );
});

//////////////////////////
// Settings > Alert
//////////////////////////
app.get("/settings/threshold", (req, res) => {
  var create_time = getDateTime();
  //connection.connect();
  connection.query(
    `select
    ht.node_name,
    ht.cluster_name,
    ht.cpu_warn,
    ht.cpu_danger,
    ht.ram_warn,
    ht.ram_danger,
    ht.storage_warn,
    ht.storage_danger,
    ht.created_time,
    ht.updated_time
    from tb_host_threshold ht
    order by cluster_name, node_name;`,
    (err, result) => {
      res.send(result.rows);
      //connection.end();
    }
  );
});

app.post("/settings/threshold", (req, res) => {
  var now = getDateTime();
  let query = `
  INSERT INTO public.tb_host_threshold(
    node_name, cluster_name, cpu_warn, cpu_danger, ram_warn, ram_danger, storage_warn, storage_danger, created_time, updated_time)
    VALUES ('${req.body.nodeName}', '${req.body.clusterName}', ${req.body.cpuWarn}, ${req.body.cpuDanger}, ${req.body.ramWarn}, ${req.body.ramDanger}, ${req.body.storageWarn}, ${req.body.stroageDanger}, '${now}', '${now}');
  `;

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Host Threshold is saved !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Save was faild, please check Host Threshold : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.put("/settings/threshold", (req, res) => {
  var now = getDateTime();
  let query = `
  UPDATE public.tb_host_threshold
	SET cpu_warn=${req.body.cpuWarn}, cpu_danger=${req.body.cpuDanger}, ram_warn=${req.body.ramWarn}, ram_danger=${req.body.ramDanger}, storage_warn=${req.body.storageWarn}, storage_danger=${req.body.storageDanger}, updated_time='${now}'	WHERE cluster_name='${req.body.clusterName}' AND node_name='${req.body.nodeName}';
  `;

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Host Threshold is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check threshold : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.delete("/settings/threshold", (req, res) => {
  let query = `delete from tb_host_threshold 
  where node_name = '${req.body.node}' and cluster_name = '${req.body.cluster}';`;
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Delete was successful!!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Delete was faild, please check error : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.post("/settings/threshold/log", (req, res) => {
  let data = req.body.g_clusters;

  let clusters = "";
  let condition = "1=1";
  data.forEach((item, index) => {
    if(item === 'allClusters'){
      return false;
    } else {

      if (index === data.length - 1) {
        clusters = clusters + `'${item}'`;
      } else {
        clusters = clusters + `'${item}',`;
      }
    }
  });

  if(clusters !== "") condition = `cluster_name in (${clusters})`;

  let queryString = `select
  tl.node_name,
  tl.cluster_name,
  tl.created_time,
  tl.status,
  tl.message,
  tl.resource
  from tb_threshold_log tl
  where ${condition}
  order by created_time desc, node_name;`;

  connection.query(queryString, (err, result) => {
    res.send(result.rows);
  });
});

app.post("/settings/threshold/setlog", (req, res) => {
  var now = getDateTime();
  let query = `

  INSERT INTO public.tb_threshold_log(
    cluster_name, node_name, created_time, status, message, resource)
    VALUES ('${req.body.clusterName}', '${req.body.nodeName}', '${now}', '${req.body.status}', '${req.body.message}', '${req.body.resource}');
  `;

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Host Threshold is saved !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Save was faild, please check Host Threshold : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

//all nodes metrics
app.get("/apis/nodes_metric", (req, res) => {
  var request = require("request");
  var options = {
    uri: `${apiServer}/apis/nodes_metric`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

//get metering list
app.get("/apis/metering", async (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/metering.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  var date = getDateTime();
  var dateBeforeDay = getDateBefore("d", 1);

  let resultData = [];

  let totalRange = 0;

  let query = `SELECT 
  mc.region,
  mc.region_name,
  mc.cost as region_cost,
  mc.created_time as region_created_time,
  mw.id,
  mw.cpu, 
  mw.memory, 
  mw.disk,
  mw.cost,
  mw.created_time,
  mw.updated_time
  FROM tb_metering_cluster AS mc
  LEFT OUTER JOIN tb_metering_worker mw ON mc.region = mw.region
  order by region_created_time desc, region, id;
    `;
  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let regionObjects = {};
    queryResult.forEach((item) => {
      regionObjects[item.region] = {
        region: item.region,
        region_name: item.region_name,
        cost: item.region_cost,
        created_time: item.region_created_time,
        workers: [],
      };
    });
    let regionArray = Object.values(regionObjects);

    queryResult.forEach((item) => {
      regionArray.forEach((value) => {
        if (item.region === value.region) {
          value.workers.push({
            id: item.id,
            cpu: item.cpu,
            memory: item.memory,
            disk: item.disk,
            cost: item.cost,
            created_time: item.created_time,
            updated_time: item.updated_time,
          });
          return false;
        }
      });
    });

    resultData = regionArray;
  }

  res.send(resultData);
});

//metering region add
app.post("/apis/metering", (req, res) => {
  var date = getDateTime();
  let query = `
  INSERT INTO public.tb_metering_cluster(region, cost, region_name, created_time, updated_time) VALUES ('${req.body.regionCode}', ${req.body.regionCost}, '${req.body.regionName}', '${date}', '${date}');
  `;

  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Metering Region is Registered !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

//update metring settings
app.put("/apis/metering", (req, res) => {
  var date = getDateTime();
  var dateBefore = getDateBefore("h", 1);
  let resultData = [];

  let query = `
  INSERT INTO tb_dashboard (user_id, component) VALUES ('${req.body.userId}', '{${req.body.myComponents}}') ON CONFLICT(user_id) DO
  UPDATE SET component='{${req.body.myComponents}}'
  `;

  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Group role is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check policy : " + err,
      };
      res.send(result_set);
    }
  });
});

app.post("/apis/metering/worker", (req, res) => {
  const now = getDateTime();
  const region = req.body.region;
  const regionCost = req.body.regionCost;
  const insertData = req.body.newRecord;
  const updateData = req.body.updateRecord;
  const deleteData = req.body.deleteRecord;

  let query = `UPDATE public.tb_metering_cluster set cost=${regionCost} WHERE region='${region}'; `

  if(insertData.length > 0){
    insertData.forEach(item => {
      query = query + `INSERT INTO public.tb_metering_worker(
        region, cpu, memory, disk, cost, created_time, updated_time)
        VALUES ('${region}', ${item.cpu}, ${item.memory}, ${item.disk}, ${item.cost}, '${now}', '${now}'); `
    })
  }

  if(updateData.length > 0){
    updateData.forEach(item => {
      query = query + `UPDATE public.tb_metering_worker
      SET cpu=${item.cpu}, memory=${item.memory}, disk=${item.disk}, cost=${item.cost}, updated_time='${now}'
      WHERE id=${item.id}; `
    })
  }

  if(deleteData.length > 0){
    deleteData.forEach(item => {
      query = query + `DELETE FROM public.tb_metering_worker
      WHERE id=${item.id}; `
    })
  }

  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Metering Worker Data is Updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.get("/apis/billing", async (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/metering_bill.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  var date = getDateTime();
  var dateBeforeDay = getDateBefore("d", 1);

  let resultData = [];

  let totalRange = 0;

  let query = `select substring(CAST(date AS VARCHAR), 1,7) date, 
	region, clusters, workers, hours, cost, cpu, memory, disk
	from tb_billings
	order by date desc, region, cost;
  `;

  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let billObjects = {};
    queryResult.forEach((item) => {
      let year = item.date.split('-')[0];
      let month = item.date.split('-')[0];

      billObjects[item.date] = {
        date : item.date,
        year: item.date.split('-')[0],
        month: item.date.split('-')[1],
        cost: item.cost,
        details: [],
      };
    });
    let billArray = Object.values(billObjects);


  //   date, 
	// region, clusters, workers, hours, cost, cpu, memory, disk
  
    queryResult.forEach((item) => {
      billArray.forEach((value) => {
        if (item.date === value.date) {
          value.details.push({
            region: item.region,
            clusters: item.clusters,
            worker_spec: `${item.cpu}vCPU / ${item.memory}GB / ${item.disk}GB`,
            workers : item.workers,
            hours: item.hours,
            cost: item.cost,
          });
          return false;
        }
      });
    });

    resultData = billArray;
  }

  res.send(resultData);
});

app.get("/apis/migration/log", (req, res) => {
  let request = require("request");

  let options = {
    uri: `${apiServer}/apis/migration/log`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/migration", (req, res) => {
  let data = JSON.stringify(req.body);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/migration`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/snapshot/list", (req, res) => {
  let request = require("request");
  let data = JSON.stringify(req.body);
  let options = {
    uri: `${apiServer}/apis/snapshot/list`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/snapshot", (req, res) => {
  let data = JSON.stringify(req.body);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/snapshot`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/snapshot/restore", (req, res) => {
  let data = JSON.stringify(req.body);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/snapshot/restore`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/apis/snapshot/log", (req, res) => {
  let request = require("request");

  let options = {
    uri: `${apiServer}/apis/snapshot/log`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/apis/globalcache", (req, res) => {
  let request = require("request");

  let options = {
    uri: `${apiServer}/apis/globalcache`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

///////////////////////
// Dashboard APIs
///////////////////////
app.get("/apis/dashboard/components", (req, res) => {
  let userId = req.query.userId;
  let query = `select cd.code,cd.description, dash.mycomp
  from tb_codes cd
  left outer join (
       select UNNEST( ds.component ::TEXT[] ) myComp
    from tb_dashboard ds
    where ds.user_id = '${userId}') dash on cd.code = dash.myComp
  where cd.kinds = 'DASHBOARD';`;
  connection.query(query, (err, result) => {
    res.send(result.rows);
  });
});

app.put("/apis/dashboard/components", (req, res) => {
  let query = `
  INSERT INTO tb_dashboard (user_id, component) VALUES ('${req.body.userId}', '{${req.body.myComponents}}') ON CONFLICT(user_id) DO
  UPDATE SET component='{${req.body.myComponents}}'
  `;

  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Group role is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check policy : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.post("/apis/yamleapply", (req, res) => {
  const YAML = req.body.yaml;

  console.log(YAML)
  
  var options = {
    uri: `${apiServer}/apis/yamlapply`,
    method: "POST",
    body: YAML,
  };
  
  var request = require("request");
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.post("/apis/dashboard/status", (req, res) => {
  let data = JSON.stringify(req.body);
  let request = require("request");

  let options = {
    uri: `${apiServer}/apis/dashboard/status`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/region_groups", (req, res) => {
  // let rawdata = fs.readFileSync("./json_data/dashboard.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let request = require("request");
  let data = JSON.stringify(req.body);
  let options = {
    uri: `${apiServer}/apis/dashboard/region_groups`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/omcp", (req, res) => {
  //   let rawdata = fs.readFileSync("./json_data/dashboard.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);
  let request = require("request");
  let data = JSON.stringify(req.body);

  let options = {
    uri: `${apiServer}/apis/dashboard/omcp`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/world_cluster_map", (req, res) => {
  let request = require("request");
  let data = JSON.stringify(req.body);
  let options = {
    uri: `${apiServer}/apis/dashboard/world_cluster_map`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/cluster_topology", (req, res) => {
  //   let rawdata = fs.readFileSync("./json_data/dash_topology.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let data = JSON.stringify(req.body);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/dashboard/cluster_topology`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/service_topology", (req, res) => {
  //   let rawdata = fs.readFileSync("./json_data/dash_service_topology.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let data = JSON.stringify(req.body);
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/dashboard/service_topology`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/service_region_topology", (req, res) => {
  //   let rawdata = fs.readFileSync("./json_data/dash_service_region_topology.json");
  // let overview = JSON.parse(rawdata);
  // res.send(overview);

  let request = require("request");
  let data = JSON.stringify(req.body);
  let options = {
    uri: `${apiServer}/apis/dashboard/service_region_topology`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
      res.send(error);
    }
  });
});

app.post("/apis/dashboard/power_usage", async (req, res) => {
  var date = getDateTime();
  var dateBeforeDay = getDateBefore("d", 1);

  let resultData = {
    range: [],
    rows: [],
  };
  let totalRange = 0;

  let query = `select CASE WHEN code = 'POWER-LOW' THEN 'low'
                WHEN code = 'POWER-MEDIUM' THEN 'medium'
                ELSE 'high' END as name, description as value from tb_codes
              where kinds = 'CONFIG'
              and code like 'POWER%'
              order by code desc;
    `;
  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let low = 0;
    let medium = 0;
    let high = 0;
    queryResult.forEach((item) => {
      if (item.name === "high") {
        totalRange = item.value;
        high = item.value;
      } else if (item.name === "medium") {
        medium = item.value;
      } else {
        low = item.value;
      }
    });
    resultData.range = [
      { name: "low", value: parseFloat(low) },
      { name: "medium", value: medium - low },
      { name: "high", value: high - medium },
    ];
  }

  // query = `SELECT AVG(power) AS usage
  //         FROM (
  //           select cluster_name, sum(power) power, collected_time
  //           from node_power_usage 
  //           group by cluster_name, collected_time
  //         ) AS node_power_usage
  //         WHERE (cluster_name, collected_time) in (
  //         select cluster_name, MAX(collected_time) as max_date
  //         from node_power_usage group by cluster_name order by max_date desc
  //         );
  //   `;
  query = `SELECT SUM(power) AS usage 
  FROM node_power_usage
  WHERE (cluster_name, node_name, collected_time) IN (
      SELECT cluster_name, node_name, MAX(collected_time) as max_date
      FROM node_power_usage group by cluster_name, node_name
      ORDER BY max_date desc
      );
    `;

  let queryResult2 = await excuteQuery(query);
  if (queryResult2.length > 0) {
    let data = queryResult2[0];
    let usage = parseFloat(parseFloat(data.usage).toFixed(1));
    // console.log("usage : ", data.usage);
    if (data.usage === null) {
      usage = 0;
    }
    resultData.rows.push({
      name: "usage",
      value: usage,
    });

    resultData.rows.push({
      name: "available",
      value: totalRange - usage,
    });
  }

  res.send(resultData);
});

// #######################
// Multiple Metric
// #######################

app.post("/apis/metric/clusterlist", (req, res) => {
  let request = require("request");
  let data = JSON.stringify(req.body);
  let options = {
    uri: `${apiServer}/apis/metric/clusterlist`,
    method: "POST",
    body: data,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

app.get("/apis/metric/clusterState", async (req, res) => {
  let resultData = {
    nodeState: {},
    podState: {},
    workloadState: {
      deployment: "0",
      replicaset: "0",
      statefulset: "0",
    },
    serviceState: {
      service: "0",
      endpoint: "0",
    },
  };

  let query = `select * from cluster_node_state
    where cluster_name = '${req.query.cluster}'
    order by collected_time desc
    limit 1;
    `;
  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let data = queryResult[0];

    resultData.nodeState = {
      status: [
        {
          name: "online",
          value: parseInt(data.node_online_cnt),
        },
        {
          name: "offline",
          value: parseInt(data.node_offline_cnt),
        },
      ],
    };
  }

  query = `select * from cluster_pod_state
    where cluster_name = '${req.query.cluster}'
    order by collected_time desc
    limit 1;    
    `;

  let queryResult2 = await excuteQuery(query);
  if (queryResult2.length > 0) {
    let data = queryResult2[0];
    resultData.podState = {
      status: [
        {
          name: "running",
          value: parseInt(data.pod_running),
        },
        {
          name: "abnormal",
          value: parseInt(data.pod_abnormal),
        },
        {
          name: "etc",
          value:
            parseInt(data.pod_total) -
            parseInt(data.pod_running) -
            parseInt(data.pod_abnormal),
        },
      ],
    };
  }

  query = `select * from cluster_service_state
    where cluster_name = '${req.query.cluster}'
    order by collected_time desc
    limit 1;
    `;

  let queryResult3 = await excuteQuery(query);
  if (queryResult3.length > 0) {
    let data = queryResult3[0];
    resultData.serviceState = {
      service: data.service_cnt,
      endpoint: data.endpoint_cnt,
    };
  }

  query = `select * from cluster_workload_state
    where cluster_name = '${req.query.cluster}'
    order by collected_time desc
    limit 1;
    `;
  let queryResult4 = await excuteQuery(query);
  if (queryResult4.length > 0) {
    let data = queryResult4[0];
    resultData.workloadState = {
      deployment: data.deployment_cnt,
      replicaset: data.replicaset_cnt,
      statefulset: data.statefulset_cnt,
    };
  }

  res.send(resultData);
});

app.get("/apis/metric/apiServer", async (req, res) => {
  var date = getDateTime();
  var dateBefore = getDateBefore("h", 1);
  let resultData = [];

  // let query = `SELECT *
  // FROM apiserver_state
  // where reqests_per_sec <> '' and latency <> ''
  // and cluster_name = '${req.query.cluster}'
  // and collected_time >= '2021-11-17 15:00:00'
  // and collected_time < '2021-11-17 16:00:00'
  // order by collected_time desc;
  //   `;

  let query = `SELECT *
  FROM apiserver_state
  where reqests_per_sec <> '' and latency <> '' 
  and cluster_name = '${req.query.cluster}' 
  and collected_time >= '${dateBefore}' 
  and collected_time < '${date}'
  order by collected_time desc;
  `;

  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    var data = {};
    queryResult.forEach((item) => {
      data = {
        unit: "sec",
        requests_per_sec: parseFloat(item.reqests_per_sec).toFixed(2),
        latency: parseFloat(item.latency).toFixed(2),
        time: item.collected_time,
      };
      resultData.push(data);
    });
  }
  res.send(resultData);
});

app.get("/apis/metric/namespacelist", (req, res) => {
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/metric/namespacelist?cluster=${req.query.cluster}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Metric Namespace
app.get("/apis/metric/namespaceState", async (req, res) => {
  var date = getDateTime();
  var dateBeforeHour = getDateBefore("h", 1);
  var dateBeforeMinute = getDateBefore("m", 20);
  let resultData = {
    volumeState: {
      pvc_cnt: "0",
    },
    workloadState: {
      deployment: "0",
      replicaset: "0",
      statefulset: "0",
    },
    serviceState: {
      service: "0",
      endpoint: "0",
    },
    podState: {},
    netState: [],
    cpuTop5: [],
    memoryTop5: [],
  };

  let query = `SELECT *
                FROM namespace_volume_state
                where cluster_name <> '' and namespace_name <> ''
                and cluster_name = '${req.query.cluster}' 
                and namespace_name = '${req.query.namespace}'
                order by collected_time desc
                limit 1;
              `;

  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let data = queryResult[0];

    resultData.volumeState = {
      pvc_cnt: parseInt(data.pvc_cnt),
    };
  }

  query = `  SELECT *
  FROM namespace_workload_state
  where cluster_name <> '' and namespace_name <> ''
  and cluster_name = '${req.query.cluster}' 
  and namespace_name = '${req.query.namespace}'
  order by collected_time desc
  limit 1;;
  `;
  let queryResult2 = await excuteQuery(query);
  if (queryResult2.length > 0) {
    let data = queryResult2[0];
    resultData.workloadState = {
      deployment: data.deployment_cnt,
      replicaset: data.replicaset_cnt,
      statefulset: data.statefulset_cnt,
    };
  }

  query = `  
    SELECT *
    FROM namespace_service_state
    where cluster_name <> '' and namespace_name <> ''
    and cluster_name = '${req.query.cluster}' 
    and namespace_name = '${req.query.namespace}'
    order by collected_time desc
    limit 1;
    `;

  let queryResult3 = await excuteQuery(query);
  if (queryResult3.length > 0) {
    let data = queryResult3[0];
    resultData.serviceState = {
      service: data.service_cnt,
      endpoint: data.endpoint_cnt,
    };
  }

  query = `SELECT *
    FROM namespace_pod_state
    where cluster_name <> '' and namespace_name <> ''
    and cluster_name = '${req.query.cluster}' 
    and namespace_name = '${req.query.namespace}'
    order by collected_time desc
    limit 1;    
    `;

  let queryResult4 = await excuteQuery(query);
  if (queryResult4.length > 0) {
    let data = queryResult4[0];
    resultData.podState = {
      status: [
        {
          name: "running",
          value: parseInt(data.pod_running),
        },
        {
          name: "abnormal",
          value: parseInt(data.pod_abnormal),
        },
        {
          name: "etc",
          value:
            parseInt(data.pod_total) -
            parseInt(data.pod_running) -
            parseInt(data.pod_abnormal),
        },
      ],
    };
  }

  // 10분단위로 해야함
  query = `SELECT cluster_name, namespace_name, trim(n_rx)::float n_rx, trim(n_tx)::float n_tx, collected_time
            FROM namespace_resources
            where cluster_name <> '' and namespace_name <> ''
            and cluster_name = '${req.query.cluster}' 
            and namespace_name = '${req.query.namespace}'
            and collected_time >= '${dateBeforeMinute}'
            and collected_time < '${date}'
            order by collected_time;
          `;

  //  query = `SELECT cluster_name, namespace_name, n_rx, n_tx, collected_time
  //  FROM namespace_resources
  //  where cluster_name <> '' and namespace_name <> ''
  //  and cluster_name = '${req.query.cluster}'
  //  and namespace_name = '${req.query.namespace}'
  // and collected_time >= '${dateBeforeMinute}'
  // and collected_time < '${date}'
  // order by collected_time desc;
  // `;

  let queryResult5 = await excuteQuery(query);
  if (queryResult5.length > 0) {
    queryResult5.forEach((item) => {
      let data = {
        unit: "ms",
        rx: parseFloat(parseFloat(item.n_rx).toFixed(4)),
        tx: parseFloat(parseFloat(item.n_tx).toFixed(4)),
        time: item.collected_time,
      };
      resultData.netState.push(data);
    });
  }

  query = `SELECT distinct cluster_name, namespace_name, trim(cpu_usage)::float cpu_usage, collected_time
            FROM namespace_resources
            where cluster_name = '${req.query.cluster}' and
            (namespace_name, collected_time ) in
            (select namespace_name, MAX(collected_time) AS max_date
            from namespace_resources
            group by namespace_name
            order by max_date desc) 
            order by cpu_usage desc
            limit 5;
          `;

  let queryResult6 = await excuteQuery(query);
  if (queryResult6.length > 0) {
    queryResult6.forEach((item) => {
      let data = {
        name: item.namespace_name,
        usage: parseFloat(parseFloat(item.cpu_usage).toFixed(4)),
      };
      resultData.cpuTop5.push(data);
    });
  }

  query = `SELECT distinct cluster_name, namespace_name, trim(memory_usage)::float memory_usage, collected_time
            FROM namespace_resources
            where cluster_name = '${req.query.cluster}' and
            (namespace_name, collected_time ) in
            (select namespace_name, MAX(collected_time) AS max_date
            from namespace_resources
            group by namespace_name
            order by max_date desc) 
            order by memory_usage desc
            limit 5;
          `;

  let queryResult7 = await excuteQuery(query);
  if (queryResult7.length > 0) {
    queryResult7.forEach((item) => {
      let data = {
        name: item.namespace_name,
        usage: parseFloat(parseFloat(item.memory_usage).toFixed(4)),
      };
      resultData.memoryTop5.push(data);
    });
  }

  res.send(resultData);
});

app.get("/apis/metric/nodelist", (req, res) => {
  let request = require("request");
  let options = {
    uri: `${apiServer}/apis/metric/nodelist?cluster=${req.query.cluster}`,
    method: "GET",
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.send(body);
    } else {
      console.log("error", error);
    }
  });
});

// Metric Node
app.get("/apis/metric/nodeState", async (req, res) => {
  var date = getDateTime();
  var dateBeforeHour = getDateBefore("h", 1);
  var dateBeforeMinute = getDateBefore("m", 20);
  let resultData = {
    cpuCount: {
      value: "0",
    },
    memoryCount: {
      value: "0",
    },
    podState: {},
    diskState: [],
    netState: [],
    cpuUsage: [],
    memoryUsage: [],
  };

  let query = `SELECT *
                FROM node_cpu_usage
                where cluster_name = '${req.query.cluster}'
                and node_name = '${req.query.node}'
                order by collected_time desc
                limit 1;
              `;

  let queryResult = await excuteQuery(query);
  if (queryResult.length > 0) {
    let data = queryResult[0];
    resultData.cpuCount = {
      value: parseInt(data.total_cpu_cnt) + " cpu",
    };
  }

  query = `SELECT *
            FROM node_memory_usage
            where cluster_name = '${req.query.cluster}'
            and node_name = '${req.query.node}'
            order by collected_time desc
            limit 1;
            `;
  let queryResult2 = await excuteQuery(query);
  if (queryResult2.length > 0) {
    let data = queryResult2[0];
    resultData.memoryCount = {
      value: convertBytes(data.node_memory_total),
    };
  }

  query = `SELECT *
          FROM node_pod_state
          where cluster_name = '${req.query.cluster}' 
          and node_name = '${req.query.node}'
          order by collected_time desc
          limit 1;    
          `;

  let queryResult3 = await excuteQuery(query);
  if (queryResult3.length > 0) {
    let data = queryResult3[0];
    resultData.podState = {
      quota: parseInt(data.node_pod_quota.trim()),
      running: parseInt(data.node_pod_running_count.trim()),
      abnormal:
        data.node_pod_abnormal_count.trim() === ""
          ? 0
          : parseInt(data.node_pod_abnormal_count),
    };
  }

  // 10분단위로 해야함
  //   query = ` SELECT cluster_name, node_name, node_disk_size_capacity capacity,
  //   node_disk_size_usage usage, collected_time
  //   FROM node_disk_usage
  //   where cluster_name = '${req.query.cluster}'
  //   and node_name = '${req.query.node}'
  //   and collected_time >= '2021-11-17 15:40:00'
  //   and collected_time < '2021-11-17 16:00:00'
  //   order by collected_time desc;
  // `;
  query = ` SELECT cluster_name, node_name, node_disk_size_capacity capacity,
             node_disk_size_usage usage, collected_time
      FROM node_disk_usage
      where cluster_name = '${req.query.cluster}' 
      and node_name = '${req.query.namespace}' 
      and collected_time >= '${dateBeforeMinute}' 
      and collected_time < '${date}'
      order by collected_time;
      `;

  let queryResult4 = await excuteQuery(query);
  if (queryResult4.length > 0) {
    queryResult4.forEach((item) => {
      let data = {
        unit: "GB",
        capacity: parseFloat(
          (parseFloat(item.capacity.trim()) / Math.pow(1024, 3)).toFixed(1)
        ),
        usage: parseFloat(
          (parseFloat(item.usage.trim()) / Math.pow(1024, 3)).toFixed(1)
        ),
        time: item.collected_time,
      };
      resultData.diskState.push(data);
    });
  }

  // 10분단위로 해야함
  // query = ` SELECT cluster_name, node_name, node_net_bytes_received rx,
  //                  node_net_bytes_transmitted tx, collected_time
  //           FROM node_net_usage
  //           where cluster_name = '${req.query.cluster}'
  //           and node_name = '${req.query.node}'
  //           and collected_time >= '2021-11-17 15:40:00'
  //           and collected_time < '2021-11-17 16:00:00'
  //           order by collected_time desc;
  //         `;

  query = ` SELECT cluster_name, node_name, 
                     node_net_bytes_transmitted tx, node_net_bytes_received rx, collected_time
              FROM node_net_usage
              where cluster_name = '${req.query.cluster}' 
              and node_name = '${req.query.namespace}' 
              and collected_time >= '${dateBeforeMinute}' 
              and collected_time < '${date}'
              order by collected_time;
              `;

  let queryResult5 = await excuteQuery(query);
  if (queryResult5.length > 0) {
    queryResult5.forEach((item) => {
      let data = {
        unit: "KB",
        rx: parseFloat(
          (parseFloat(item.rx.trim()) / Math.pow(1024, 1)).toFixed(1)
        ),
        tx: parseFloat(
          (parseFloat(item.tx.trim()) / Math.pow(1024, 1)).toFixed(1)
        ),
        time: item.collected_time,
      };
      resultData.netState.push(data);
    });
  }

  query = ` SELECT cluster_name, node_name, avg1m, collected_time
            FROM node_cpu_usage
            where cluster_name = '${req.query.cluster}' 
            and collected_time >= '${dateBeforeMinute}' 
            and collected_time < '${date}'
            order by collected_time, node_name;
          `;

  let queryResult6 = await excuteQuery(query);

  if (queryResult6.length > 0) {
    let tempData = [];
    queryResult6.forEach((item) => {
      // arr[item.collected_time] = [item.namespace_name] = parseFloat(item.avg1m)

      let data = {
        [item.node_name]: item.avg1m,
        time: item.collected_time,
      };
      tempData.push(data);
    });

    let dataGroupBy = groupBy(tempData, "time");
    Object.keys([dataGroupBy][0]).map((key) => {
      var dataObject = {};
      dataObject["unit"] = "bytes";
      [dataGroupBy][0][key].forEach((item) => {
        dataObject["time"] = item.collected_time;
        Object.keys(item).map((key) => {
          dataObject[key.trim()] = item[key];
        });
      });
      // [Number(key), resultData.memoryUsage[0][key]]
      resultData.cpuUsage.push(dataObject);
    });
  }

  query = ` SELECT cluster_name, node_name, node_memory_utilisation, collected_time
            FROM node_memory_usage
            where cluster_name = '${req.query.cluster}' 
            and collected_time >= '${dateBeforeMinute}' 
            and collected_time < '${date}'
            order by collected_time, node_name;
          `;

  let queryResult7 = await excuteQuery(query);

  if (queryResult7.length > 0) {
    let tempData = [];
    queryResult7.forEach((item) => {
      let data = {
        [item.node_name]: item.node_memory_utilisation,
        time: item.collected_time,
      };
      tempData.push(data);
    });

    let dataGroupBy = groupBy(tempData, "time");
    Object.keys([dataGroupBy][0]).map((key) => {
      var dataObject = {};
      dataObject["unit"] = "bytes";
      [dataGroupBy][0][key].forEach((item) => {
        dataObject["time"] = item.collected_time;
        Object.keys(item).map((key) => {
          dataObject[key.trim()] = item[key];
        });
      });
      // [Number(key), resultData.memoryUsage[0][key]]
      resultData.memoryUsage.push(dataObject);
    });
  }

  res.send(resultData);
});

app.get("/apis/config-codes", async (req, res) => {
  let userId = req.query.userId;
  let query = `select *
  from tb_codes cd
  where cd.kinds = 'CONFIG';`;
  connection.query(query, (err, result) => {
    res.send(result.rows);
  });
});

app.put("/apis/config-codes/dashboard-config/refresh-cycle", (req, res) => {
  let query = `
  UPDATE public.tb_codes
	SET description='${req.body.config}'
  WHERE kinds='CONFIG' AND code='DASHBOARD-CYCLE';
  `;

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Dashboard Cycle config is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check value : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.put("/apis/config-codes/dashboard-config/power-usage-range", (req, res) => {
  let query = `
  UPDATE public.tb_codes
	SET description='${req.body.low}'
  WHERE kinds='CONFIG' AND code='POWER-LOW';

  UPDATE public.tb_codes
	SET description='${req.body.medium}'
  WHERE kinds='CONFIG' AND code='POWER-MEDIUM';

  UPDATE public.tb_codes
	SET description='${req.body.high}'
  WHERE kinds='CONFIG' AND code='POWER-HIGH';
  `;

  //connection.connect();
  connection.query(query, (err, result) => {
    if (err !== "null") {
      const result_set = {
        data: [],
        message: "Dashboard Power Usage config is updated !!",
      };
      res.send(result_set);
    } else {
      const result_set = {
        data: [],
        message: "Update was faild, please check value : " + err,
      };
      res.send(result_set);
    }
    //connection.end();
  });
});

app.listen(port, () => console.log(`Listening on port ${port}`));
