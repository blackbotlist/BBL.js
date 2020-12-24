// Modules
const fetch = require("node-fetch");
const si = require("systeminformation");
const { EventEmitter } = require("events");

class BBL extends EventEmitter {
    constructor(options) {
        super();

        const { key, client } = options;
        
        // Check for discord.js
        try {
            this.discord = require("discord.js");
        } catch(e) {
            throw new Error("BBL.js needs discord.js to function");
        }

        // Key error handling
        if (!key) throw new Error('"key" is missing or undefined');
        if (typeof key !== "string") throw new TypeError('"key" is not typeof string');
        // Client error handling
        if (!client) throw new Error('"client" is missing or undefined');
        
        
        // Post arg error checking
        // Local config
        this.autoposting = false;

        // Local config
        this.autoposting = false;

        // API config
        this.baseApiUrl = "https://black-bot-list.tk/api/auth/stats/";
        this.key = key;
        this.client = client;

       
        // Check for sharding
        if (this.client.shard) {
            this.sharding = true;

            throw new Error("Please use the BBL sharding client if you wish to use shards");
        } else this.sharding = false;
    }

    /**
     * Manual posting
     * @returns {Promise<boolean | Error>} returns false if there was no error, returns an error if there was.
     */
    async post() {
        // Non-Sharding client
        if (this.sharding) return new Error("Please use the BBL sharding client if you wish to use shards");

        
        // Post data
        
        

        // Get custom field one value
        
        let guild_count = this.client.guilds.cache.size;
        let requestBody = {
            
            "count": guild_count.toString(), // Server count
            
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

        // Server error on statcord
        if (response.status >= 500) {
            this.emit("post", new Error(`BBL server error, statuscode: ${response.status}`));
            return;
        }

        // Get body as JSON
        let responseData;
        try {
            responseData = await response.json();
        } catch {
            this.emit("post", new Error(`BBL server error, invalid json response`));
            return;
        }

        // Check response for errors
        if (response.status == 200) {
            // Success
            this.emit("post", false);
        } else if (response.status == 400 || response.status == 429) {
            // Bad request or Rate limit hit
            if (responseData.error) this.emit("post", new Error(responseData.message));
        } else {
            // Other
            this.emit("post", new Error("An unknown error has occurred"));
        }
    }

    // Auto posting
    async autopost() {
        // Non-Sharding client
        if (this.sharding) throw new Error("Please use the BBL sharding client if you wish to use shards");

        let post = await this.post(); // Create first post
    
        // set interval to post every hour
        setInterval(
            async () => {
                await this.post(); // post once every hour
            },
            60000
        );

        // set autoposting var
        this.autoposting = true;

        this.emit("autopost-start");

        // resolve with initial errors
        return Promise.resolve(post);
    }

    // Post stats about a command
    
}

module.exports = BBL;
