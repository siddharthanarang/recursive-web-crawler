var request                     = require('request');
var cheerio                     = require('cheerio');

var logging                     = require('./../logging');
var constants                   = require('./constants');
var urlQueue                    = require('./urlQueue');
var dbHandler                   = require('../../databases/mysql/mysqlLib');

module.exports.requestWebPage   =  requestWebPage;

var maxRequests                 = constants.maxRequests; // Maximum Request we will be hitting to the baseUrl
var totalHits                   = 0; // Maintaining a record of no of total hits we have consumed

var currentHits                 = 0; // Maintaining a record of no of concurrent hits at a particular time
var baseUrl                     = constants.baseUrl;
var extractedLinks              = {};

function requestWebPage(webUrl){
  return new Promise((resolve, reject) =>{

    if(totalHits >= maxRequests){
      logging.trace({event : "Max request Reached", totalHits : totalHits, maxRequests : maxRequests});
      urlQueue.stopFurtherCrawling();
      return resolve();
    }

    if(currentHits >= constants.maxCrawlingConcurrentRequests){
      logging.trace({event : "Current request limit Reached", currentHits : currentHits});
      urlQueue.pushUrlInQueue(webUrl);
      return resolve();
    }

    var options = {
      url : webUrl,
      method : "GET",
      timeout : 10000
    };
    incrementCurrentHits();
    request(options, function (error, response, body) { // Requesting the particular page
      decrementCurrentHits();
      urlQueue.processCrawling(); //  Calling function for the next crawl by this fully utilizing the slots

      totalHits++;
      extractedLinks[webUrl] = true;
      logging.trace({event : "Requested WebPage Result", webUrl : webUrl, error : error});
      if(error || (response && response.statusCode != 200)){
        logging.error({event : "Requested WebPage Error", statusCode : response && response.statusCode, error : error});
        return resolve();
      }
      parseWebPage(body);
      return resolve();
    });
  });
}

function incrementCurrentHits(){
  currentHits++;
  logging.trace({event : "incrementCurrentHits", currentHits : currentHits});
  return;
}

function decrementCurrentHits(){
  currentHits--;
  logging.trace({event : "decrementCurrentHits", currentHits : currentHits});
  return;
}

function parseWebPage(pageContent) {
  getLinksFromHtml(pageContent);
  return;
}

function getLinksFromHtml(pageContent) {
  var $ = cheerio.load(pageContent);
  getInternalLinks($);
  getExternalLinks($);
  return;
}

function getInternalLinks($){ // getting all links which has relative path of the base url like /topic/health
  var links = $(`a[href^="/"]`); //jquery selector to get all internal hyperlinks
  (links).each(function(i, link){
    if(!link){
      return;
    }
    var internalLink = $(link).attr('href');
    if(internalLink.indexOf(constants.basePath) == 0){
      link = constants.baseProtocol + internalLink; // attaching baseProtocol to the relative path of the link
    }
    else{
      link = baseUrl + internalLink; // attaching baseUrl to the relative path
    }
    var segregatedUrl = splitLink(link);
    logging.trace({event : "segregatedUrl of InternalLinks", link : internalLink, segregatedUrl : segregatedUrl});
    storeLink(segregatedUrl);
  });
  return;
}

function getExternalLinks($){ // getting all links which has absolute path of the base url like https://medium.com/3minread
  var links = $(`a[href^="${baseUrl}"]`); //jquery selector to get all external hyperlinks

  (links).each(function(i, link){
    if(!link){
      return;
    }
    var externalLink = $(link).attr('href');
    link = externalLink;
    var segregatedUrl = splitLink(link);
    logging.trace({event : "segregatedUrl of ExternalLinks", link : externalLink, segregatedUrl : segregatedUrl});
    storeLink(segregatedUrl);
  });
  return;
}

function splitLink(link){

  // splitting link with url and param 

  logging.trace({event : "splitLink",link : link});
  if(!link){
    return;
  }
  var url = link.split('?')[0];
  url = removeForwardSlash(url);
  var param = getParams(link.split('?')[1]);
  param = param ? param : {};
  return {url : url, param : param, link : link};
}

function removeForwardSlash(url) {
  if (url.substr(-1) == "/") {
    url = url.substr(0, url.length - 1);
  }
  return url;
}

function getParams(param){
  
  // getting all the params present in the link

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
  
  /* This function is performing 3 steps
  
   1. Pushing the link in crawlingQueue so that crawler can pick it up from there for crawling. Only that link
   which has already not occurred till now will be put.

   2. Calling processCrawling function when currentHits = 0 that will arrive when crawling queue has become empty 
   then start it again.
  
   3. Storing the url, count and params in the database
  
   */
  
  logging.trace({event : "store segregatedLink", linkInformation : linkInformation});

  if(!linkInformation.link){
    return;
  }
  if(extractedLinks[linkInformation.link] == undefined){
    extractedLinks[linkInformation.link] =false;
    urlQueue.pushUrlInQueue(linkInformation.link);
  }
  if(currentHits == 0){
    urlQueue.processCrawling(); // if crawling stops when crawling queue has become empty then start it again
  }
  insertLinkInformation(linkInformation);// Keeping it asynchronus as insertion doesn't depend on next crawling
  return;
}

function insertLinkInformation(linkInformation) {

  logging.trace({event : "insertLinkInformation", linkInformation : linkInformation});

  return new Promise((resolve, reject) => {
    var sql = ` INSERT INTO tb_url_store(url, url_count, params) 
                VALUES(?, ?, ?) 
                ON DUPLICATE KEY 
                UPDATE url_count = url_count + 1, params=JSON_MERGE_PATCH(params, VALUES(params))`;
    var params = [linkInformation.url, 1,  JSON.stringify(linkInformation.param || {})];
    
    dbHandler.mysqlQueryPromise("Inserting Link In DataBase", sql, params).then((result) =>{
      return resolve(result);
    },(error) =>{
      return reject(error);
    });
  });
}
