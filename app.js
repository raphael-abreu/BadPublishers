var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var tex = require('tex');
//var Fuse = require('Fuse.js');
var stringSimilarity = require('string-similarity');
app.use(bodyParser());
app.set('view engine', 'pug');


app.set('port', (process.env.PORT || 5000));


function predator_search(list,string){

	for (var i = list.length - 1; i >= 0; i--) {
		var similarity = stringSimilarity.compareTwoStrings(string, list[i]); 
		if (similarity > 0.8 ){
			return list[i];
		}
		
	}
	return false;
}


// lista de editoriais predatórios e revistas encontrados em:: https://scholarlyoa.com/
// A lista de revistas é standalone, ou seja, Não relacionada com os publishers encontrados
// Um problema é que a lista de editoriais não leva em conta os jornais destes publishers.
var journals = require("./journals.json");
var publishers = require("./publishers.json");
      



var items = [];



app.get('/', function(req, res) {
	  res.render('index', { items })
});



app.post('/', function(req, res){
	items = [];
	var cont = 0;
	var item = [];
	var formImput = req.body.formImput;
	var sample = tex.parseBibTeXEntries(formImput);
	for (var i = 0; i < sample.length; i++) {
		var actualReference = tex.flattenBibTeXEntry(sample[i]);
		item[0] = (i+1);
		item[1] = actualReference.title;
		if (actualReference.publisher) { // se tiver editor no bibtex.
			item[2] =  actualReference.publisher;
			var result = predator_search(publishers.predatory_publishers,actualReference.publisher);
			if (result) {
				item[3] = result;
				cont++;
			}else{
				item[3] = false;
			}
		}
		if (actualReference.journal) { // se não tiver editorial predatório, será que tem revista?
			item[4] =  actualReference.journal;
		  	var result = predator_search(journals.predatory_standalone_journals,actualReference.journal);
		  	if (result){
		  		item[5] =  result;
		  		cont++;
		  	}else{
				item[5] = false;
			}
	  	}

	items.push({number: item[0], article: item[1], publisher: item[2],badPublisher: item[3], journal: item[4],badJournal: item[5]});
	item = []; // unset
	}
res.render('index', { items, contador: cont })
});



app.post('/checkpub', function(req, res){
	var publisherResponse = true;
	var publisherType;
	var publisherImput = req.body.publisherImput;
	var result = predator_search(publishers.predatory_publishers,publisherImput);
	if (result) {
		publisherType = result;
	}else{
		publisherType = false;
	}	

res.render('index', { publisherType, publisherResponse })
});













app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});



