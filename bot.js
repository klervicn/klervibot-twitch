const { oauth, clientId, connection } = require("./config");
const pgp = require("pg-promise")();
const db = pgp(connection);
const fetch = require("node-fetch");
const tmi = require("tmi.js");
const moment = require("moment");
const oldPointer = moment("20000101");
const commandHistory = {
  nayrulive: {
    commands: oldPointer,
    coupe: oldPointer,
    twitter: oldPointer,
    youtube: oldPointer,
    insta: oldPointer,
    uptime: oldPointer
  },
  frozencrystal: {
    boutique: oldPointer,
    commands: oldPointer,
    twitter: oldPointer,
    youtube: oldPointer,
    insta: oldPointer,
    uptime: oldPointer
  },
  collinsandkosuke: {
    boutique: oldPointer,
    commands: oldPointer,
    twitter: oldPointer,
    youtube: oldPointer,
    insta: oldPointer,
    uptime: oldPointer,
    server: oldPointer
  }
};

const boutiqueLink = {
  collinsandkosuke: `La boutique de vêtement de C&K, c'est par ici : https://teespring.com/stores/collinskosuke`,
  frozencrystal: `Y'a de chouettes choses à acheter par là : https://teespring.com/stores/frozencrystalshop`
};

const youtubeLink = {
  nayrulive: "https://www.youtube.com/c/Nayru",
  collinsandkosuke: "https://www.youtube.com/collinskosuke",
  frozencrystal: "https://www.youtube.com/user/teddymint3"
};

const instaLink = {
  nayrulive: "https://www.instagram.com/nayrutv/",
  collinsandkosuke: "https://www.instagram.com/collinskosuke/",
  frozencrystal: "https://www.instagram.com/_frozencrystal/"
};

const twitterLink = {
  nayrulive: "https://twitter.com/Nayruuu",
  collinsandkosuke: "https://twitter.com/CollinsKosuke",
  frozencrystal: "https://twitter.com/frozencrystal"
};

const commandsAvailable = {
  nayrulive:
    "Les commandes disponibles sont !insta, !twitter, !uptime et !youtube",
  collinsandkosuke:
    "Les commandes disponibles sont !boutique, !insta, !serveur, !twitter, !uptime et !youtube",
  frozencrystal:
    "Les commandes disponibles sont !boutique, !insta, !twitter, !uptime et !youtube"
};

// Valid commands start with:
const commandPrefix = "!";
// Define configuration options:
const opts = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: "klervibot",
    password: "oauth:" + oauth
  },
  channels: ["nayrulive", "collinsandkosuke", "frozencrystal"]
};

// These are the commands the bot knows (defined below):
//  tips, palier, twitter, insta
const knownCommands = {
  choixpeau,
  coupe,
  youtube,
  insta,
  twitter,
  maison,
  uptime,
  serveur,
  commands,
  boutique
};

function boutique(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg = boutiqueLink[channel[1]];
  if (
    (channel[1] === "collinsandkosuke" || channel[1] === "frozencrystal") &&
    now.diff(commandHistory[channel[1]].commands, "seconds") >= 15
  ) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].commands = now;
  } else return;
}

function commands(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg = commandsAvailable[channel[1]];
  db.any("SELECT * FROM house")
    .then(function(data) {
      console.log(data);
      // success;
    })
    .catch(function(error) {
      console.error(error);
      // error;
    });

  if (now.diff(commandHistory[channel[1]].commands, "seconds") >= 15) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].commands = now;
  } else return;
}

function coupe(target, context) {
  const now = moment();
  const channel = target.split("#");

  if (now.diff(commandHistory[channel[1]].commands, "seconds") >= 15) {
    db.any("SELECT * FROM house")
      .then(function(data) {
        for (const house of data) {
          sendMessage(
            target,
            context,
            `${house.housename} : ${house.score} points`
          );
        }
        commandHistory[channel[1]].commands = now;
        // success;
      })
      .catch(function(error) {
        console.error(error);
        return;
        // error;
      });
  } else return;
}

function maison(target, context) {
  const { username } = context;
  db.any('SELECT * FROM "user" WHERE username = $1', username).then(function(
    data
  ) {
    console.log(data);
    if (data.length === 0) {
      sendMessage(
        target,
        context,
        `Tu n'es dans aucune maison pour l'instant, ${username} !`
      );
    } else {
      sendMessage(
        target,
        context,
        `${username}, tu fais partie de la maison ${
          data[0].housename
        }, et tu as rapporté ${data[0].earned_points} points !`
      );
    }
  });
}

function choixpeau(target, context) {
  /** If a user has already a house, don't run */
  const { username } = context;
  const role = context.mod || context.badges.subcriber === 1 ? "Mod" : "None";

  db.any('SELECT * FROM "user" WHERE username = $1', username)
    .then(function(data) {
      if (data.length === 0) {
        console.log("No record with this pseudo");
        db.any("SELECT * FROM house")
          .then(function(data) {
            const randomHouse =
              data[Math.floor(Math.random() * data.length)].housename;
            console.log(randomHouse);

            db.none(
              'INSERT INTO "user"(username, housename, earned_points, role) VALUES($1, $2, $3, $4)',
              [username, randomHouse, 0, role]
            )
              .then(() => {
                sendMessage(
                  target,
                  context,
                  `Le choixpeau a décidé... Ce sera... ${randomHouse} pour ${username} !`
                );
              })
              .catch(error => {
                console.error(error);
              });
          })
          .catch(function(error) {
            console.error(error);
            // error;
          });
      } else {
        console.log("Record found !");
        sendMessage(
          target,
          context,
          `Bien tenté ${username}, mais le choix du Choixpeau est définitif !`
        );
      }
    })
    .catch(function(error) {
      console.error(error);
      return;
      // error;
    });
}

function youtube(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg =
    "Pour nous rejoindre sur YouTube, c'est par ici : " +
    youtubeLink[channel[1]];

  if (now.diff(commandHistory[channel[1]].youtube, "seconds") >= 15) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].youtube = now;
  } else return;
}

function insta(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg = "Les jolies photos, c'est par là : " + instaLink[channel[1]];
  if (now.diff(commandHistory[channel[1]].insta, "seconds") >= 15) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].insta = now;
    console.log(target, context);
  } else return;
}

function serveur(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg =
    "C&K jouent sur un serveur privé VeryGames. Si tu es intéressé, voici le lien pour louer un serveur : https://www.verygames.net/fr !";
  if (
    channel[1] === "collinsandkosuke" &&
    now.diff(commandHistory[channel[1]].server, "seconds") >= 15
  ) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].server = now;
  } else return;
}

function twitter(target, context) {
  const now = moment();
  const channel = target.split("#");
  const msg = "Pour être au courant de tout : " + twitterLink[channel[1]];
  if (now.diff(commandHistory[channel[1]].twitter, "seconds") >= 15) {
    sendMessage(target, context, msg);
    commandHistory[channel[1]].twitter = now;
  } else return;
}

function uptime(target, context) {
  const channel = target.split("#");
  const now = moment();

  fetch(`https://api.twitch.tv/helix/streams?user_login=${channel[1]}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", "Client-ID": clientId }
  })
    .then(res => res.json())
    .then(json => {
      if (json.data[0]) {
        if (now.diff(commandHistory[channel[1]].uptime, "seconds") >= 15) {
          const diff = now.diff(json.data[0].started_at);
          const diffDuration = moment.duration(diff);
          const diffHours = diffDuration.hours();
          const diffMinutes = diffDuration.minutes();
          const mess =
            diffHours > 0
              ? `Le stream de ${
                  channel[1]
                } a commencé il y a ${diffHours} heure(s) et ${diffMinutes} minute(s)`
              : `Le stream de ${
                  channel[1]
                } a commencé il y a ${diffMinutes} minute(s)`;

          sendMessage(target, context, mess);
          commandHistory[channel[1]].uptime = now;
        } else return;
      } else {
        if (now.diff(commandHistory[channel[1]].uptime, "seconds") >= 60) {
          sendMessage(
            target,
            context,
            `${
              channel[1]
            } n'est pas en live actuellement, mais vous pouvez suivre la chaîne pour être notifié lors des prochains streams !`
          );
          commandHistory[channel[1]].uptime = now;
        } else return;
      }
    });
}

// Helper function to send the correct type of message:
function sendMessage(target, context, message) {
  if (context["message-type"] === "whisper") {
    client.whisper(target, message);
  } else {
    client.say(target, message);
  }
}

// Create a client with our options:
let client = new tmi.client(opts);

// Register our event handlers (defined below):
client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);
client.on("disconnected", onDisconnectedHandler);

// Connect to Twitch:
client.connect();

client.on("connected", (adress, port) => {
  console.log(
    client.getUsername() +
      " s'est connecté sur : " +
      adress +
      ", port : " +
      port
  );
});

client.on("subscription", function(channel, username) {
  if (channel === "nayrulive") {
    db.any('SELECT * FROM "user" WHERE username = $1', username).then(function(
      data
    ) {
      if (data.length === 0) {
        return;
      } else {
        db.tx(t => {
          // creating a sequence of transaction queries:
          const { housename } = data;
          const q1 = t.none(
            'UPDATE "user" SET earned_points = earned_points + 10 where username = $1',
            [username]
          );
          const q2 = t.none(
            "UPDATE house SET score = score + 10 where housename = $1",
            [housename]
          );

          // returning a promise that determines a successful transaction:
          return t.batch([q1, q2]); // all of the queries are to be resolved;
        })
          .then(data => {
            // success, COMMIT was executed
            const msg = `Bien joué ${username}, tu viens de faire gagner 10 points à ${housename}`;
            client.say(channel, msg);
          })
          .catch(error => {
            // failure, ROLLBACK was executed
            console.error(error);
          });
      }
    });
  } else return;
});

// Called every time a message comes in:
function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } // Ignore messages from the bot

  // This isn't a command since it has no prefix:
  if (msg.substr(0, 1) !== commandPrefix) {
    console.log(
      `[${target} (${context["message-type"]})] ${context.username}: ${msg}`
    );
    return;
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(" ");
  // The command name is the first (0th) one:
  const commandName = parse[0];
  // The rest (if any) are the parameters:
  const params = parse.splice(1);

  // If the command is known, let's execute it:
  if (commandName in knownCommands) {
    // Retrieve the function by its name:
    const command = knownCommands[commandName];
    // Then call the command with parameters:
    command(target, context, params);
    console.log(`* Executed ${commandName} command for ${context.username}`);
  } else {
    console.log(`* Unknown command ${commandName} from ${context.username}`);
  }
}

// Called every time the bot connects to Twitch chat:
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

// Called every time the bot disconnects from Twitch:
function onDisconnectedHandler(reason) {
  console.log(`Disconnected: ${reason}`);
  process.exit(1);
}
