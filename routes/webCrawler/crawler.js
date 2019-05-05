var request = require('request');
var cheerio = require('cheerio');
var logging = require('./logging');

var maxRequests = 5;
var currentHits = 0;
var baseUrl     = "https://www.npmjs.com/package/request";
var extractedLinks = {};

requestWebPage(baseUrl);


function requestWebPage(webUrl){
  return new Promise((resolve, reject) =>{
    var options = {
      url : webUrl,
      method : "GET",
      timeout : 10000
    };
    incrementCurrentHits();
    request(options, function (error, response, body) {
      logging.trace({event : "Request Webpage"}, {webUrl : webUrl}, {error : error});
      decrementCurrentHits();
      if(error || response.statusCode != 200){
        return resolve();
      }
      parseWebPage(body);
      return resolve();
      
    });
  });
}

function incrementCurrentHits(){
  currentHits++;
  return;
}

function decrementCurrentHits(){
  currentHits--;
  return;
}

function parseWebPage(pageContent) {
  console.log('inside parseWebPage');
  getLinksFromHtml(pageContent);
  return;
}

function getLinksFromHtml(pageContent) {
  var $ = cheerio.load(pageContent);
  getInternalLinks($);
  getExternalLinks($);
  return;
}

function getInternalLinks($){
  var links = $(`a[href^="/"]`); //jquery get all internal hyperlinks
  console.log('links are  getInternalLinks ',links);

  (links).each(function(i, link){
    if(!link){
      return;
    }
    console.log('link 1 is ',link);
    console.log('link 2 is ',$(link).attr('href'));
    var internalLink = $(link).attr('href');
    link = baseUrl + internalLink;
    console.log('link 3 is ',link);

    var segregatedUrl = splitUrl(link);
    logging.trace({event : "getInternalLinks"}, {link : internalLink}, {segregatedUrl : segregatedUrl});
    storeLink(segregatedUrl);
  });
  return;
}

function getExternalLinks($){
  var links = $(`a[href^="${baseUrl}"]`); //jquery get all hyperlinks
  console.log('links are getExternalLinks',links);

  (links).each(function(i, link){
    if(!link){
      return;
    }
    var externalLink = $(link).attr('href');
    link = externalLink;
    var segregatedUrl = splitUrl(link);
    logging.trace({event : "getExternalLinks"}, {link : externalLink}, {segregatedUrl : segregatedUrl});
    storeLink(segregatedUrl);
  });
  return;
}

function splitUrl(link){
  console.log('splitUrl is ',link);

  if(!link){
    return;
  }
  var url = link.split('?')[0];
  var param = getParams(link.split('?')[1]);
  param = param ? param : {};
  return {url : url, param : param};

}

function getParams(param){
  var allParams = {};

  if(!param){
    return {};
  }
  var splitParam = param.split('&');
  if(!splitParam || splitParam.length ==0){
    return {};
  }
  for(var i=0; i<splitParam.length; i++){
    var actualParam = splitParam[i].split('=')[0];

    if(!actualParam){
      continue;
    }
    if(!allParams[actualParam]){
      allParams[actualParam] = 1;
    }
  }
  return allParams;
}

function storeLink(linkInformation){
  if(!linkInformation.url){
    return;
  }
  if(!extractedLinks[linkInformation.url]){
    extractedLinks[linkInformation.url] =false;
  }
  console.log('extractedLinks is ',extractedLinks);
  // Insert Link Information in Database
  return;
}









// var baseUrl = 'https://github.com';
// //var baseUrl = 'static.npmjs.com';
//
// var scrapFile = fs.readFile('./scrapFile.html', 'utf8', function (err, data) {
//   var $ = cheerio.load(data);
//   //var links = $('a'); //jquery get all hyperlinks
//   var links = $(`a[href^="${baseUrl}"]`); //jquery get all hyperlinks
//   console.log('links are ',links);
//   $(links).each(function(i, link){
//     var segregatedUrl = splitUrl($(link).attr('href'));
//     //console.log($(link).attr('href'));
//     console.log(segregatedUrl.url || '', '        ', segregatedUrl.param || []);
//   });
// });
//
