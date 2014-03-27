var steam
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request')
	, d = new Date();

steam = function(kiel){

	var user_ids = ['76561198074274428','76561198034317478','76561198039481612','76561198028204074','76561198023242054','76561198053949796','76561198047264333','76561198047715950','76561198047008591','76561198003406724','76561198006109473','76561198054322588','76561198065883048','76561198071178366','76561198065779087','76561198047135340','76561198077952390','76561198044140596','76561198045812024'];
	var app = 570	//dota2
		, key = 'F7551A7B6F9F08F73CE6B16EAE848DF5'
		, recently_played 	= "http://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=F7551A7B6F9F08F73CE6B16EAE848DF5&format=json&steamid="
		, owned_games 		= "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=F7551A7B6F9F08F73CE6B16EAE848DF5&format=json&steamid="
		, game_user_stats	= "http://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v0002/?appid=570&key=F7551A7B6F9F08F73CE6B16EAE848DF5&steamid="				//stats and achvments per game
		, game_achievements	= "http://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=570&key=F7551A7B6F9F08F73CE6B16EAE848DF5&steamid="			//all achvments per game per user, can show how many achvments are left
		, game_achv_stats	= "http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?format=json&gameid="
		, user_level		= "http://api.steampowered.com/IPlayerService/GetSteamLevel/v1?key=F7551A7B6F9F08F73CE6B16EAE848DF5&steamid="
		, get_recent_played = function() {

			user_ids.forEach(function(val,index){
				curl(recently_played+val ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val;
						body['created_at'] = d.getTime();
						db._instance().collection('recent_played', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		, get_owned_games = function() {
			user_ids.forEach(function(val,index){
				curl(owned_games+val ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val;
						body['created_at'] = d.getTime();
						db._instance().collection('owned_games', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		, get_game_user_stats = function() {
			user_ids.forEach(function(val,index){
				curl(game_user_stats+val ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val;
						body['created_at'] = d.getTime();
						db._instance().collection('game_user_stats', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		, get_game_achievements = function() {
			user_ids.forEach(function(val,index){
				curl(game_achievements+val ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val;
						body['created_at'] = d.getTime();
						db._instance().collection('game_achievements', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		, get_game_achv_stats = function() {
			curl(game_achv_stats+570 ,function(err,rs,body){
				if(!err && rs.statusCode == 200){
					body = JSON.parse(body);
					body['user_id'] = 570;
					body['created_at'] = d.getTime();
					db._instance().collection('game_achv_stats', function(err,_collection) {
						if(!err){
							_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
						}
					});
				}	
			});
		}
		, get_user_level = function() {
			user_ids.forEach(function(val,index){
				curl(user_level+val ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val;
						body['created_at'] = d.getTime();
						db._instance().collection('user_level', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		};
	return {
		get : {
			dota2 : function(req,res) {
				get_recent_played();
				get_owned_games();
				get_game_user_stats();
				get_game_achievements();
				get_game_achv_stats();
				get_user_level();
				kiel.response(req, res, {data : "running"}, 200);
			} ,
		}
	}
}

module.exports = steam;