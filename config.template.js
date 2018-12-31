module.exports = {
  oauth: "Your token here without oauth:, only what is after !",
  clientID: "Your API ClientID",
  connection: {
    host: "localhost",
    port: 5432,
    database: "my-database-name",
    user: "user-name",
    password: "user-password"
  },
  shopLink: {
    channelName1: "shop link",
    channelName2: "etc"
  },
  youtubeLink: {
    channelName1: "Youtube channel link",
    channelName2: "etc"
  },
  instaLink: {
    channelName1: "Instagram link",
    channelName2: "etc"
  },
  twitterLink: {
    channelName1: "Twitter link",
    channelName2: "etc"
  },
  commandsAvailable: {
    channelName1:
      "List of commands available for a channel. This must match with the code. Example : Available commands are !insta, !twitter, !uptime et !youtube",
    channelName2: "etc"
  },
  channels: ["channelName1", "channelName2", "etc"]
};
