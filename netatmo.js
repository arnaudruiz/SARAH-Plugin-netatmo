
exports.action = function(data, callback, config, SARAH) {
  
  var config = config.modules.netatmo;
  var token_url = 'http://api.netatmo.net/oauth2/token';
  var device_url = 'http://api.netatmo.net/api/getuser?access_token=';
  var measure_url = 'http://api.netatmo.net/api/getmeasure?access_token=';
  var capteur = "";
  var humidite = config.humidite;
  SARAH.speak ("Je mesure."); 
  if (!config.netatmo_usr || !config.netatmo_pwd){
    return callback('tts', 'Configuration Netatmo invalide');
  }
  
  var token = "";
  var expiresin = "";
  var refresh_token = "";
  
  getToken(token_url, config.netatmo_usr, config.netatmo_pwd, callback, function(bodyToken){

	   var json = JSON.parse(bodyToken);
	   token = json.access_token;
	   expiresin = json.expires_in;
	   refresh_token = json.refresh_token;
	   
	   device_url = device_url+token;
	   
	   getURL(device_url,callback, function(body2){
			 var json2 = JSON.parse(body2);
			 
			 device_id = json2.body.devices[0]; 
			 
			 measure_url = measure_url+token+'&device_id='+device_id+'&type=Temperature,Humidity,CO2&scale=30min';
			 getURL(measure_url,callback,function(body3){
				var json3 = JSON.parse(body3);
				var nbmesures = (json3.body[0].value.length);
				temp = json3.body[0].value[nbmesures - 1][0];
				humid = json3.body[0].value[nbmesures - 1][1];
				co2 = json3.body[0].value[nbmesures - 1][2];
				
				var tts = "";
				capteur = data.capteur;
				
				//console.log(capteur,data.capteur,humidite); 
					
				if (capteur=='temp')
				  {
				  	tts = tts + "Il fait "+temp+" degrés";
				  	if (humidite == "Y"){
				  		tts = tts + " avec un taux d'humitité de "+humid+" pour cent. "; 
				  	}
				  }
				   
				else if (capteur=='air')
				  {
				  	tts = tts + "La qualité de l'air est "+qualiteAir(co2)+" avec un taux de "+co2+" particules de C O 2 par million."
				  }
				else if (capteur=='all'){
				  	tts = tts + "Il fait "+temp+" degrés";
				  	if (humidite == "Y"){
				  		tts = tts + " avec un taux d'humitité de "+humid+" pour cent. "; 
				  	}
					tts = tts + "La qualité de l'air est "+qualiteAir(co2)+" avec un taux de "+co2+" particules de C O 2 par million."
				}
				
				callback({'tts': tts});
				 
			 });  
	   });
  }); 
  
  

}

var getToken = function(url, username, password, callback, cb){
	 
	var request = require('request');
	
	request({ 
    	'uri'     : url,
		'method'  : 'post',
		'headers' : { 
       	           'Content-type'   : 'application/x-www-form-urlencoded;charset=UTF-8'
	   			   },
	   	'form'    : {    
	  				'grant_type' 	: "password",
	  				'client_id' 	: "52225ccf1977594e74000019",
	  				'client_secret' : "8Q5hzYXXZTY83HMEOP7Aytjp72bQ",
	  				'username' 	: username,
	  				'password' 	: password
		}
		  }, function (err, response, bodyToken){
		    
		    if (err || response.statusCode != 200) {
		      console.log(err);
		      callback({'tts': "Echec de l'opération"});
		      return;
		    }
		    
		cb (bodyToken);
	});
	
}

var getURL = function(url2, callback, cb){
	var request2 = require('request');
	
	request2(
	{'uri': url2}
	
	, function (err2, response2, body2){
		    
		    if (err2 || response2.statusCode != 200) {
		      console.log(err2);
		      callback({'tts': "Impossible d'obtenir l'équipement"});
		      return;
		    }
		    
		cb (body2);
	});
	
}

var qualiteAir = function (nbparticules){
//utilise le classement de la qualité 
//de l’air intérieur selon la 
//norme NF EN 13779

	if (nbparticules<=400)
	//<=400 ppm = Qualité de l’air intérieur excellente
	  {
	  return "excellente";
	  }
	else if (nbparticules<600)
	// entre 400 et 600 ppm = Qualité de l’air intérieur moyenne 
	  {
	  return "moyenne";
	  }
	else if (nbparticules<1000)
	// entre 600 et 1000 ppm = Qualité de l’air intérieur modérée
	  {
	  return "modérée";
	  }
	else if (nbparticules>=1000)
	// > 1000ppm Qualité de l’air intérieur basse 
	  {
	  return "mauvaise";
	  }
	else
	  {
	  x="indeterminée";
	  }
  
}
