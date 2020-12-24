// Export normal client
module.exports.Client = require("./BBL");
// Export sharding client
module.exports.ShardingClient = require("./ShardingClient");

/*
Note in files the following string will be seen "|=-ssc-=|".
This string is used to separate arguments in messages for the statcord client
*/