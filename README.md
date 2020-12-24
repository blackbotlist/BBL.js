# bbl.js
bbl.js is a NPM Package based on Statcord.js to send your Servercount and soon more to https://back-bot-list.tk 's API

## Install
```bash
npm i https://github.com/blackbotlist/BBL.js.git
```
cuz npm is shity to setup at 3AM

## Examples of use:


### Normal (Without Sharding)

```javascript
const bbl = require("bbl.js");
const Discord = require("discord.js");

const client = new Discord.Client();
// Create BBL client
const BBL = new bbl.Client({
    key: "APIKEY",
    client,
});


// Client prefix
const prefix = "cs!";

client.on("ready", async () => {
    console.log("ready");

    // Start auto posting
    BBL.autopost();
});


client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== "text") return;

    if (!message.content.startsWith(prefix)) return;

    let command = message.content.split(" ")[0].toLowerCase().substr(prefix.length);

    

    if (command == "say") {
        message.channel.send("say");
    } else if (command == "help") {
        message.channel.send("help");
    } else if (command == "post") {
        // Only owner runs this command
        if (message.author.id !== "bot_owner_id") return;

        // Example of manual posting
        BBL.post();
    }
});

BBL.on("autopost-start", () => {
    // Emitted when BBL autopost starts
    console.log("Started autopost");
});

BBL.on("post", status => {
    // status = false if the post was successful
    // status = "Error message" or status = Error if there was an error
    if (!status) console.log("Successful post");
    else console.error(status);
});

client.login("TOKEN");
```




### Sharding Usage


#### **`sharder.js`**
```javascript
    const Discord = require("discord.js");
    const bbl = require("bbl.js");

    const manager = new Discord.ShardingManager('./bot.js', { token: "TOKEN"});
    // Create BBL sharding client
    const BBL = new bbl.ShardingClient({
        key: "APIKEY",
        manager,
    });

   
    // Spawn shards, BBL works with both auto and a set amount of shards
    manager.spawn();

    // Normal shardCreate event
    manager.on("shardCreate", (shard) => {
        console.log(`Spawned shard ${shard.id}`);
    });

    BBL.on("autopost-start", () => {
        // Emitted when BBL autopost starts
        console.log("Started autopost");
    });

    BBL.on("post", status => {
        // status = false if the post was successful
        // status = "Error message" or status = Error if there was an error
        if (!status) console.log("successful post");
        else console.error(status);
    });
```

#### **`bot.js`**
```javascript
const Discord = require("discord.js");
const BBL = require("bbl.js");

const client = new Discord.Client();
/* There is no need to create a BBL client in the bot script,
because it has already been made in the sharding script
*/

// Client prefix
const prefix = "cs!";

client.on("ready", async () => {
    console.log("ready");
});

client.on("message", async (message) => {
    if (message.author.bot) return;
    if (message.channel.type !== "text") return;

    if (!message.content.startsWith(prefix)) return;

    let command = message.content.split(" ")[0].toLowerCase().substr(prefix.length);


    if (command == "say") {
        message.channel.send("say");
    } else if (command == "help") {
        message.channel.send("help");
    } else if (command == "post") {
        // Only owner runs this command
        if (message.author.id !== "bot_owner_id") return;

        // Example of manual posting
        BBL.ShardingClient.post(client);

        // Errors on the sharding client will be sent to the console straight away
    }
});

client.login("TOKEN");
```


# Thanks to Statcord.js for being a good open source npm package that is used here as a Base!