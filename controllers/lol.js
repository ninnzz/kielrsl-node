var lol
	, db = require(__dirname + "/../helpers/ndb")
	, curl = require('request')
	, d = new Date();

lol = function(kiel){

	var user_ids = [	{id:19787999,region:'na'},
						{id:62396,region:'lan'},
						{id:199486,region:'lan'},
						{id:526984,region:'lan'},
						{id:65573,region:'las'},
						{id:32644,region:'las'},
						{id:156285,region:'lan'},
						{id:139240,region:'lan'},
						{id:24640,region:'lan'},
						{id:21394,region:'lan'},
						{id:237011,region:'tr'},
						{id:512874,region:'tr'},
						{id:690287,region:'tr'},
						{id:19887289,region:'na'},
						{id:1821,region:'na'},
						{id:23897083,region:'na'},
						{id:579944,region:'oce'},
						{id:720476,region:'oce'},
						{id:324210,region:'oce'},
						{id:575072,region:'oce'},
						{id:300152,region:'oce'},
						{id:463560,region:'oce'},
						{id:343839,region:'oce'}
					]
		, api_key = "053694d4-c6d9-4669-b655-14fd94634e8a"
		, season = "SEASON4"
		, stats_by_summoner_ranked = "https://prod.api.pvp.net/api/lol/{r}/v1.2/stats/by-summoner/{u}/ranked?season="+season+"&api_key="+api_key
		, stats_by_summoner_summary = "https://prod.api.pvp.net/api/lol/{r}/v1.2/stats/by-summoner/{u}/summary?season="+season+"&api_key="+api_key
		, summoner = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}?api_key="+api_key
		, summoner_masteries = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}/masteries?api_key="+api_key
		, summoner_runes = "https://prod.api.pvp.net/api/lol/{r}/v1.3/summoner/{u}/runes?api_key="+api_key
		;
	return {
		get : {
			'riot.html' : function(req,res) {
				res.writeHeader(200, {"Content-Type": "text/html"});  
		        res.write('5bb132ac-71ba-42aa-9900-fd644c2e93e2');  
		        res.end(); 
			}
		}
	}
}

module.exports = lol;
