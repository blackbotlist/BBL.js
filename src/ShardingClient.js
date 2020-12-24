// Modules
const fetch = require("node-fetch");
const si = require("systeminformation");
const ShardingUtil = require("./util/shardUtil");
const { EventEmitter } = require("events");
const util = require("util");
const fs = require("fs");

class ShardingClient extends EventEmitter {
    static post = ShardingUtil.post;
    static postCommand = ShardingUtil.postCommand;

    constructor(options) {
        super();

        if (!options.debug) options.debug = {
            enabled: false,
            outfile: null
        }

        this.debug = options.debug.enabled || false;
        this.debug_outfile = options.debug.outfile || null;

        const { key, manager } = options;

        // Check for discord.js
        try {
            this.discord = require("discord.js");
        } catch (e) {
            throw new Error("statcord.js needs discord.js to function");
        }

        // Key error handling
        if (!key) throw new Error('"key" is missing or undefined');
        if (typeof key !== "string") throw new TypeError('"key" is not typeof string');
        

        // Local config
        this.autoposting = autopost;

        // API config
        this.baseApiUrl = "https://statcord.com/logan/stats";
        this.key = key;
        this.manager = manager;

        

        // Check if all shards have been spawned
        this.manager.on("shardCreate", (shard) => {
            // Get current shard
            let currShard = this.manager.shards.get(shard.id);

            // If this is the last shard, wait until it is ready
            if (shard.id + 1 == this.manager.totalShards && autopost) {
                // When ready start auto post
                this.debugLog("Listening for final shard \"ready\" event");
                currShard.once("ready", () => {
                    setTimeout(async () => {
                        this.debugLog("Starting autopost");
                        this.emit("autopost-start");

                        this.debugLog("Initial post");
                        this.post();

                        this.debugLog("Starting interval");

                        setInterval(() => {
                            this.post();
                        }, 60000);
                    }, 200);
                });
            }

            // Start message listener
            
        });
    }

    // Post stats to API
    async post() {
        this.debugLog("Starting post", "post");

      
        let guild_count = await getGuildCountV12(this.manager);
        
        // Get client id
        let id = (await this.manager.broadcastEval("this.user.id"))[0];

        // Post data
        let requestBody = {
            
            "count": guild_count.toString(), // Server count
           
        
        }

        // Get custom field one value
        
        {
            this.debugLog(
              `Post Data\n${util.inspect(requestBody, false, null, false)}`,
              "post"
            );
        }

    

        // Create post request
        let response;
        try {
            response = await fetch(this.baseApiUrl + this.client.user.id, {
                method: "post",
                body: JSON.stringify(requestBody),
                headers: {
                    "Content-Type": "application/json",
                    "authorization": this.key
                }
            });
        } catch (e) {
            this.emit("post", "Unable to connect to the BBL server. Going to automatically try again in 60 seconds, if this problem persists, please visit https://discord.gg/8Pss2US5XB");

            if (!this.autoposting) {
                setTimeout(() => {
                    this.post();
                }, 60000);
            }

            return;
        }

        this.debugLog(
            `Fetch response\n${util.inspect(response, false, null, false)}`,
            "post"
        );

        // Statcord server side errors
        if (response.status >= 500) {
            this.debugLog("HTTP 500 error received", "post");
            this.emit("post", new Error(`BBL server error, statuscode: ${response.status}`));
            return;
        }

        // Get body as JSON
        let responseData;
        try {
            responseData = await response.json();
        } catch {
            this.debugLog("Invalid response data received", "post");
            this.emit("post", new Error(`BBL server error, invalid json response`));
            return;
        }

        this.debugLog(
            `Response data\n${util.inspect(responseData, false, null, false)}`,
            "post"
        );

        // Check response for errors
        if (response.status == 200) {
            this.debugLog("HTTP code 200", "post");
            // Success
            this.emit("post", false);
        } else if (response.status == 400 || response.status == 429) {
            this.debugLog(`HTTP code ${response.status}`, "post");
            this.debugLog(responseData.error, "post");
            this.debugLog(responseData.message, "post");
            // Bad request or rate limit hit
            this.emit("post", new Error(responseData.message));
        } else {
            this.debugLog(`UNKNOWN HTTP ERROR: ${response.status}`, "post");
            // Other
            this.emit("post", new Error("An unknown error has occurred"));
        }

        this.debugLog("Post end", "post");
    }

    // Post stats about a command
    

    // Register the function to get the values for posting
    
}

// V12 sharding gets 
async function getGuildCountV12(manager) {
    return (await manager.fetchClientValues("guilds.cache.size")).reduce((prev, current) => prev + current, 0);
}

async function getUserCountV12(manager) {
    const memberNum = await manager.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)');
    return memberNum.reduce((prev, memberCount) => prev + memberCount, 0);
}
// end

module.exports = ShardingClient;
