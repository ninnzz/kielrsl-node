var config = {
	"environemnt" 	: "development",
	"production"	: {
		"port"	: 80,
		"logs"	: "logs/",
		"domain"	: "http://auth.kielrsl"
	},
	"staging"	: {
		"port"	: 3000,
		"logs"	: "logs/",
		"domain"	: "http://localhost"
	},
	"development" : {
		"port"	: 3000,
		"logs"	: "logs/",
		"domain"	: "http://localhost"
	}
}
console.log("Global config files loaded......");
module.exports = config[config.environemnt];