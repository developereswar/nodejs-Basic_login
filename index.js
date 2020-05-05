const express = require("express");
const app = express();
const response = require("./response");
const jwt = require("jsonwebtoken");
const config = require("./config");
const checker = require("./tokenChecker");
const cors = require("cors");
const AWS = require("aws-sdk");
const tableName = {
  TableName: "demo",
};
const CryptoJS = require("crypto-js");

app.use(cors({origin:'*'}));
app.use(express.json());

AWS.config.update(config.awsConfig.remoteconfig);
const docClient = new AWS.DynamoDB.DocumentClient();

app.get("/", (req, res) => {
  docClient.scan(tableName, (err, data) => {
    if (err) {
      res.send("Unable to scan the table. Error JSON:");
    }
    res.send(data);

    // console.log(data["words"].join(""));
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const cryptoPassword = CryptoJS.HmacSHA1(password, "password").words[0];
  console.log(username);
  let params = {
    ...tableName,
    Item: {
      username: username,
      password: cryptoPassword
    },
  };
  await docClient.scan(params, (err, data) => {
    if(err){
      return response(res, 500, "Server Error", {
        error: "error"
      });
    }
    if (data) {
      data.Items.forEach((e) => {
        if (e.password === cryptoPassword && username === e.username) {
          let accessToken = jwt.sign({ name: username }, config.AccessToken, {
            expiresIn: config.tokenLife,
          });
          let refreshToken = jwt.sign({ name: username }, config.RefreshToken, {
            expiresIn: config.refreshTokenLife,
          });
          const result = {
            status: "Logged in",
            refreshToken: refreshToken,
            username: username
          };
          return response(res, 200, "OK", result);
        }else{
          return response(res, 500, "Server Error", {
            error: "error"
          });
        }
      });
      
    }
    
   
  });
});

// register
app.post("/register", (req, res) => {
  const { username, password, email } = req.body;
  const cryptoPassword = CryptoJS.HmacSHA1(password, "password").words[0];
  let params = {
    ...tableName,
    Item: {
      username: username,
      password: cryptoPassword,
      email: email,
    },
  };

  docClient.put(params, (err, data) => {
    //   if(err) res.status(200).({"message":''})
    if (data)
      res.status(200).json({
        status: "success",
        message: "Registered Successfully",
      });
  });
});

app.get("/post", (req, res) => {
  checker(req, res, (result) => {
    res.send(result);
  });
});



app.listen(config.port);
