const {
  oauth,
  clientID,
  connection,
  shopLink,
  youtubeLink,
  instaLink,
  twitterLink,
  commandsAvailable,
  channelsJoined
} = require('./config');
const { timeDiff } = require('./utils');
const {
  selectSpecificUserQuery,
  selectAllHousesQuery,
  createUserQuery,
  addPointsToUserQuery,
  addPointsToHouseQuery,
  selectRoleFromSpecificUserQuery,
  removePointsToUserQuery,
  removePointsToHouseQuery
} = require('./sqlQueries');
const pgp = require('pg-promise')();
const db = pgp(connection);
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const moment = require('moment');
const oldPointer = moment('20000101');
const commandHistory = {
  nayrulive: {
    choixpeau: oldPointer,
    commands: oldPointer,
    coupe: oldPointer,
    give: oldPointer,
    insta: oldPointer,
    maison: oldPointer,
    remove: oldPointer,
    twitter: oldPointer,
    uptime: oldPointer,
    youtube: oldPointer
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
    rp: oldPointer,
    server: oldPointer
  }
};

const opts = {
  options: {
    debug: true
  },
  connection: {
    reconnect: true
  },
  identity: {
    username: 'klervibot',
    password: 'oauth:' + oauth
  },
  channels: channelsJoined
};

// Valid commands start with:
const commandPrefix = '!';
// Define configuration options:

// These are the commands the bot knows (defined below), add each new command here:
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
  boutique,
  give,
  remove,
  rp
};

/**
 * Commands
 * Some commands are only available for some channels.
 */

/**
 * Return the list of commands available for the channel
 * @param {*} target
 */

function commands(target) {
  const now = moment();
  const channel = target.split('#');
  const msg = commandsAvailable[channel[1]];
  if (timeDiff(now, commandHistory[channel[1]].commands)) {
    client.say(target, msg);
    commandHistory[channel[1]].commands = now;
  } else return;
}

/**
 * Returns the link of the shop for the channel
 * @param {*} target
 */

function boutique(target) {
  const channel = target.split('#');
  if (channel[1] !== 'collinsandkosuke' || channel[1] !== 'frozencrystal') {
    return;
  }
  const now = moment();
  const msg = shopLink[channel[1]];
  if (timeDiff(now, commandHistory[channel[1]].commands)) {
    client.say(target, msg);
    commandHistory[channel[1]].commands = now;
  } else return;
}

/**
 * Returns the link of the Youtube page for the channel
 *
 * @param {*} target
 */

function youtube(target) {
  const now = moment();
  const channel = target.split('#');
  const msg =
    "Pour nous rejoindre sur YouTube, c'est par ici : " +
    youtubeLink[channel[1]];

  if (timeDiff(now, commandHistory[channel[1]].youtube)) {
    client.say(target, msg);
    commandHistory[channel[1]].youtube = now;
  } else return;
}

/**
 * Returns the link of the Instagram profile of the channel
 *
 * @param {*} target
 */

function insta(target) {
  const now = moment();
  const channel = target.split('#');
  const msg = "Les jolies photos, c'est par là : " + instaLink[channel[1]];
  if (timeDiff(now, commandHistory[channel[1].insta])) {
    client.say(target, msg);
    commandHistory[channel[1]].insta = now;
  } else return;
}

function rp(target) {
  const channel = target.split('#');
  if (channel[1] !== 'collinsandkosuke') {
    return;
  }
  const now = moment();
  const msg =
    "Collins incarne un personnage qui a sa propre histoire et sa propre identité : Ethan Collins. Il est interdit de donner des informations concernant le RP d'autres streamers dont Collins n'a pas connaissance en jeu. Merci de ne pas juger le RP des autres joueurs.";
  if (timeDiff(now, commandHistory[channel[1]].rp)) {
    client.say(target, msg);
    commandHistory[channel[1]].rp = now;
  } else return;
}

/**
 * Returns the link of the server for the channel
 *
 * @param {*} target
 */

function serveur(target) {
  const channel = target.split('#');
  if (channel[1] !== 'collinsandkosuke') {
    return;
  }
  const now = moment();
  const msg =
    'C&K jouent sur un serveur privé VeryGames. Si tu es intéressé, voici le lien pour louer un serveur : https://www.verygames.net/fr !';
  if (timeDiff(now, commandHistory[channel[1]].server)) {
    client.say(target, msg);
    commandHistory[channel[1]].server = now;
  } else return;
}

/**
 * Returns the link of the Twitter account of the channel
 *
 * @param {*} target
 */

function twitter(target) {
  const now = moment();
  const channel = target.split('#');
  const msg = 'Pour être au courant de tout : ' + twitterLink[channel[1]];
  if (timeDiff(now, commandHistory[channel[1]].twitter)) {
    client.say(target, msg);
    commandHistory[channel[1]].twitter = now;
  } else return;
}

/**
 * Returns the uptime of the current stream
 *
 * @param {*} target
 */

function uptime(target) {
  const channel = target.split('#');
  const now = moment();

  fetch(`https://api.twitch.tv/helix/streams?user_login=${channel[1]}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Client-ID': clientID }
  })
    .then(res => res.json())
    .then(json => {
      if (json.data[0]) {
        if (timeDiff(now, commandHistory[channel[1]].uptime, 60)) {
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

          client.say(target, mess);
          commandHistory[channel[1]].uptime = now;
        } else return;
      } else {
        if (timeDiff(now, commandHistory[channel[1]].uptime, 60)) {
          client.say(
            target,
            `${
              channel[1]
            } n'est pas en live actuellement, mais vous pouvez suivre la chaîne pour être notifié lors des prochains streams !`
          );
          commandHistory[channel[1]].uptime = now;
        } else return;
      }
    });
}

/**
 *
 * Hogwarts house cup module, only for NayruLive
 *
 *
 *
 */

/**
 * Returns scoreboard
 *
 * @param {*} target
 */

async function coupe(target) {
  try {
    const now = moment();
    const channel = target.split('#');
    if (channel[1] !== 'nayrulive') {
      return;
    }
    if (timeDiff(now, commandHistory[channel[1]].coupe)) {
      const houses = await db.any(selectAllHousesQuery);
      for (const house of houses) {
        client.say(target, `${house.housename} : ${house.score} points`);
      }
      commandHistory[channel[1]].coupe = now;
    } else return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Returns user house
 *
 * @param {*} target
 * @param {*} context
 * @param {*} params
 */

async function maison(target, context, params) {
  try {
    const channel = target.split('#');
    const now = moment();
    if (channel[1] !== 'nayrulive') {
      return;
    }
    if (timeDiff(now, commandHistory[channel[1]].maison)) {
      const username =
        params.length > 0 ? params[0].toLowerCase() : context.username;
      const user = await db.oneOrNone(selectSpecificUserQuery, username);
      if (user === null) {
        client.say(
          target,
          `${username} n'est dans aucune maison pour l'instant !`
        );
      } else {
        console.log(target);
        client.say(
          target,
          `${username} fait partie de la maison ${
            user.housename
          }, et a rapporté ${user.earned_points} points !`
        );
      }
      commandHistory[channel[1]].maison = now;
    } else return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Randomly place a user in a house
 *
 * @param {*} target
 * @param {*} context
 */

async function choixpeau(target, context) {
  try {
    const now = moment();
    const channel = target.split('#');
    if (channel[1] !== 'nayrulive') {
      return;
    }

    if (timeDiff(now, commandHistory[channel[1]].choixpeau, 10)) {
      /** If a user has already a house, don't run */
      const { username } = context;
      const role =
        context.mod ||
        (context.badges !== null && context.badges.broadcaster === 1)
          ? 'Mod'
          : 'None';

      const user = await db.oneOrNone(selectSpecificUserQuery, username);
      if (user === null) {
        const houses = await db.any(selectAllHousesQuery);
        const randomHouse =
          houses[Math.floor(Math.random() * houses.length)].housename;
        console.log(randomHouse);
        await db.none(createUserQuery, [username, randomHouse, 0, role]);
        client.say(
          target,
          `Le choixpeau a décidé... Ce sera... ${randomHouse} pour ${username} !`
        );
      } else {
        client.say(
          target,
          `Bien tenté ${username}, mais le choix du Choixpeau est définitif !`
        );
      }
      commandHistory[channel[1]].choixpeau = now;
    } else return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
/**
 *
 * Give points to an user :
 * !give <username> <points>
 *
 * @param {*} target
 * @param {*} context
 * @param {Array} params
 * @param {Boolean} isAddition
 */

async function give(target, context, params, isAddition = true) {
  try {
    const channel = target.split('#');
    const now = moment();

    if (channel[1] !== 'nayrulive' || params.length !== 2) {
      return;
    }
    if (timeDiff(now, commandHistory[channel[1]].give, 10)) {
      const { username } = context;
      const targetUsername = params[0].toLowerCase();
      const nbPoints = parseInt(params[1]);

      // Check if user is mod

      const role = await db.oneOrNone(
        selectRoleFromSpecificUserQuery,
        username
      );
      console.log(role);

      if (role === null) {
        client.say(
          target,
          'Participez à la cérémonie de répartition avec le !choixpeau avant de distribuer des points !'
        );
        return;
      } else {
        if (role.role !== 'Mod') {
          client.say(
            target,
            'Bien essayé, mais seuls les préfets peuvent donner des points'
          );
          return;
        }
        const user = await db.oneOrNone(
          selectSpecificUserQuery,
          targetUsername
        );
        if (user === null) {
          client.say(
            target,
            "Le sorcier que vous désignez n'est dans aucune maison pour le moment"
          );
          return;
        } else {
          const { housename, earned_points } = user;
          if (earned_points - nbPoints < 0 && !isAddition) {
            client.say(
              target,
              "Ce sorcier ne peut perdre que des points qu'il a gagné, sinon c'est pas très juste quand même"
            );
            return;
          }
          db.tx(t => {
            // creating a sequence of transaction queries:
            const q1 = t.none(
              isAddition ? addPointsToUserQuery : removePointsToUserQuery,
              [nbPoints, targetUsername]
            );
            const q2 = t.none(
              isAddition ? addPointsToHouseQuery : removePointsToHouseQuery,
              [nbPoints, housename]
            );

            // returning a promise that determines a successful transaction:
            return t.batch([q1, q2]); // all of the queries are to be resolved;
          })
            .then(() => {
              // success, COMMIT was executed
              const msg = isAddition
                ? `Bien joué ${targetUsername}, tu viens de faire gagner ${nbPoints} points à ${housename}`
                : ` ${targetUsername}, tu viens de faire perdre ${nbPoints} points à ${housename}`;
              client.say(target, msg);
            })
            .catch(error => {
              // failure, ROLLBACK was executed
              console.error(error);
            });
        }
      }
      commandHistory[channel[1]].give = now;
    } else return;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
/**
 *
 * Remove points from an user :
 * !remove <username> <points>
 *
 * @param {*} target
 * @param {*} context
 * @param {*} params
 */

function remove(target, context, params) {
  const channel = target.split('#');
  if (channel[1] !== 'nayrulive') {
    return;
  }
  give(target, context, params, false);
}

// Create a client with our options:
let client = new tmi.client(opts);

// Register our event handlers (defined below):
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

// Connect to Twitch:
client.connect();

client.on('connected', (adress, port) => {
  console.log(
    client.getUsername() +
      " s'est connecté sur : " +
      adress +
      ', port : ' +
      port
  );
});

/**
 * Give points to an user when he subscribes, only if he is placed in a house
 *
 */

client.on('subscription', function(channel, username) {
  if (channel === 'nayrulive') {
    db.any(selectSpecificUserQuery, username).then(function(data) {
      if (data.length === 0) {
        return;
      } else {
        db.tx(t => {
          // creating a sequence of transaction queries:
          const { housename } = data;
          const q1 = t.none(addPointsToUserQuery, [10, username]);
          const q2 = t.none(addPointsToHouseQuery, [10, housename]);

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
      `[${target} (${context['message-type']})] ${context.username}: ${msg}`
    );
    return;
  }

  // Split the message into individual words:
  const parse = msg.slice(1).split(' ');
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
