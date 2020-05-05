const config = {
  AccessToken: "AccessSecret",
  RefreshToken: "RefreshSecret",
  tokenLife: 900,
  refreshTokenLife: 10,
  port: 8080,
  awsConfig: {
    localconfig: { tabalename: "demo", region: "us-east-1" },
    endpoint: "http://localhost:8080",
    remoteconfig: {

      region: "us-east-1",
    }
  },
};

module.exports = config;
