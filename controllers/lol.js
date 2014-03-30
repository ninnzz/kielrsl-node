var lol
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request')
	, d = new Date();

lol = function(kiel){

	var user_ids1 = [	{id:19787999,region:'na'},
						{id:62396,region:'lan'},
						{id:526984,region:'lan'},
						{id:65573,region:'las'},
						{id:32644,region:'las'},
						{id:156285,region:'lan'},
						{id:139240,region:'lan'},
						{id:24640,region:'lan'},
						{id:21394,region:'lan'},
						{id:237011,region:'tr'}
					]
						
		,user_ids2 =[	{id:512874,region:'tr'},
						{id:690287,region:'tr'},
						{id:19887289,region:'na'},
						{id:1821,region:'na'},
						{id:23897083,region:'na'},
						{id:579944,region:'oce'},
						{id:720476,region:'oce'},
						{id:324210,region:'oce'},
						{id:300152,region:'oce'},
						{id:343839,region:'oce'}
					]
		, api_key = "053694d4-c6d9-4669-b655-14fd94634e8a"
		, season = "SEASON4"
		, stats_by_summoner_ranked = "https://prod.api.pvp.net/api/lol/{r}/v1.2/stats/by-summoner/{u}/ranked?season="+season+"&api_key="+api_key
		, stats_by_summoner_summary = "https://prod.api.pvp.net/api/lol/{r}/v1.2/stats/by-summoner/{u}/summary?season="+season+"&api_key="+api_key
		, summoner = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}?api_key="+api_key
		, summoner_masteries = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}/masteries?api_key="+api_key
		, summoner_runes = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}/runes?api_key="+api_key
		, team_by_summoner = "https://prod.api.pvp.net/api/lol/{r}/v2.2/team/by-summoner/{u}?api_key="+api_key
		, league_by_summoner = "https://prod.api.pvp.net/api/lol/{r}/v2.3/league/by-summoner/{u}?api_key="+api_key
		, league_by_summoner_entry = "https://prod.api.pvp.net/api/lol/{r}/v2.3/league/by-summoner/{u}/entry?api_key="+api_key
		, recent_games = "https://prod.api.pvp.net/api/lol/{r}/v1.3/game/by-summoner/{u}/recent?api_key="+api_key
		get_sbsr = function(arr) {
			arr.forEach(function(val){
				var url =  (stats_by_summoner_ranked.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('stats_by_summoner_ranked', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		},
		get_sbss = function(arr) {
			arr.forEach(function(val){
				var url =  (stats_by_summoner_summary.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('stats_by_summoner_summary', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		},
		get_summoner = function(arr) {
			console.log(arr);
			arr.forEach(function(val){
				console.log(val);
				var url =  (summoner.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					console.log(err);
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('summoner', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		},
		get_summoner_masteries = function(arr) {
			arr.forEach(function(val){
				var url =  (summoner_masteries.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('summoner_masteries', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		},
		get_summoner_runes = function(arr) {
			arr.forEach(function(val){
				var url =  (summoner_runes.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('summoner_runes', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		},
		get_team_by_summoner = function(arr) {
			arr.forEach(function(val){
				var url =  (team_by_summoner.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					console.log(err);
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('team_by_summoner', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		get_league_by_summoner = function(arr) {
			arr.forEach(function(val){
				var url =  (league_by_summoner.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					console.log(err);
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('league_by_summoner', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		get_league_by_summoner_entry = function(arr) {
			arr.forEach(function(val){
				var url =  (league_by_summoner_entry.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					console.log(err);
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('league_by_summoner_entry', function(err,_collection) {
							if(!err){
								_collection.insert(body,function(err){kiel.logger(d.getTime()+' Failed to mine:'+err,'steam_debug')});
							}
						});
					}	
				});
			});
		}
		get_summoner_recent_games = function(arr) {
			arr.forEach(function(val){
				var url =  (recent_games.replace('{u}',val.id)).replace('{r}',val.region);
				curl(url ,function(err,rs,body){
					console.log(err);
					if(!err && rs.statusCode == 200){
						body = JSON.parse(body);
						body['user_id'] = val.id;
						body['created_at'] = d.getTime();
						db._instance().collection('recent_games', function(err,_collection) {
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
			overview : function(req,res) {
				get_sbsr(user_ids1);
				setTimeout(function(){get_sbss(user_ids1);},15000);
				setTimeout(function(){get_summoner_runes(user_ids1);},30000);
				setTimeout(function(){get_summoner_masteries(user_ids1);},45000);

				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends, this might take some time :)"},200);
			} ,
			teams : function(req,res) {
				get_team_by_summoner(user_ids1);
				setTimeout(function(){get_team_by_summoner(user_ids2);},15000);
				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends [teams], this might take some time :)"},200);
			},
			summoner : function(req,res) {
				get_summoner(user_ids1);
				setTimeout(function(){console.log('2nd summoner');get_summoner(user_ids2);},15000);
				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends [summoner], this might take some time :)"},200);	
			},
			league : function(req,res) {
				get_league_by_summoner(user_ids1);
				setTimeout(function(){console.log('2nd league set');get_league_by_summoner(user_ids2);},15000);
				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends [summoner], this might take some time :)"},200);	
			},
			league_entry : function(req,res) {
				get_league_by_summoner_entry(user_ids1);
				setTimeout(function(){console.log('2nd league set');get_league_by_summoner_entry(user_ids2);},15000);
				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends [summoner], this might take some time :)"},200);	
			},
			recent_games : function(req,res) {	
				get_summoner_recent_games(user_ids1);
				setTimeout(function(){console.log('2nd league set');get_summoner_recent_games(user_ids2);},15000);
				kiel.response(req,res,{data:"Processing data mining for Leauge of Legends [recent_games], this might take some time :)"},200);	
			}

		}
	}
}

module.exports = lol;
