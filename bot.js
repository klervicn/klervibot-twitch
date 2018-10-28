const { oauth, clientId } = require('./config');
const fetch = require('node-fetch');
const tmi = require('tmi.js');
const moment = require('moment');
const youtubeLink = {
  nayrulive: 'https://www.youtube.com/c/Nayru',
  collinsandkosuke: 'https://www.youtube.com/collinskosuke',
  frozencrystal: 'https://www.youtube.com/user/teddymint3'
};

const instaLink = {
  nayrulive: 'https://www.instagram.com/nayrutv/',
  collinsandkosuke: 'https://www.instagram.com/collinskosuke/',
  frozencrystal: 'https://www.instagram.com/_frozencrystal/'
};

const twitterLink = {
  nayrulive: 'https://twitter.com/Nayruuu',
  collinsandkosuke: 'https://twitter.com/CollinsKosuke',
  frozencrystal: 'https://twitter.com/frozencrystal'
};

// Valid commands start with:
let commandPrefix = '!';
// Define configuration options:
let opts = {
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
  channels: ['nayrulive', 'collinsandkosuke', 'frozencrystal']
};

// These are the commands the bot knows (defined below):
//  tips, palier, twitter, insta
let knownCommands = { echo, youtube, insta, twitter, uptime };

// Function called when the "echo" command is issued:
function echo(target, context, params) {
  // If there's something to echo:
  if (params.length) {
    // Join the params into a string:
    const msg = params.join(' ');
    // Send it back to the correct place:
    sendMessage(target, context, msg);
  } else {
    // Nothing to echo
    console.log(`* Nothing to echo`);
  }
}

function youtube(target, context) {
  const channel = target.split('#');
  const msg =
    "Pour nous rejoindre sur YouTube, c'est par ici : " +
    youtubeLink[channel[1]];
  sendMessage(target, context, msg);
}

function insta(target, context) {
  const channel = target.split('#');
  const msg = "Les jolies photos, c'est par là : " + instaLink[channel[1]];
  sendMessage(target, context, msg);
}

function twitter(target, context) {
  const channel = target.split('#');
  const msg = 'Pour être au courant de tout : ' + twitterLink[channel[1]];
  sendMessage(target, context, msg);
}

function uptime(target, context) {
  const channel = target.split('#');
  const now = moment();

  fetch(`https://api.twitch.tv/helix/streams?user_login=${channel[1]}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', 'Client-ID': clientId }
  })
    .then(res => res.json())
    .then(json => {
      if (json.data[0]) {
        sendMessage(
          target,
          context,
          `Le stream de ${channel[1]} a commencé il y a ${now.diff(
            json.data[0].started_at,
            'minutes'
          )} minutes`
        );
      } else {
        sendMessage(
          target,
          context,
          `${
            channel[1]
          } n'est pas en live actuellement, mais vous pouvez suivre la chaîne pour être notifié lors des prochains streams !`
        );
      }
    });
}

// Helper function to send the correct type of message:
function sendMessage(target, context, message) {
  if (context['message-type'] === 'whisper') {
    client.whisper(target, message);
  } else {
    client.say(target, message);
  }
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
