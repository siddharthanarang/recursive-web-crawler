var constants                     = require('./constants');
var crawler                       = require('./crawler');
var logging                       = require('../logging');

module.exports.initiateCrawling   =  initiateCrawling;
module.exports.processCrawling    =  processCrawling;
module.exports.pushUrlInQueue     =  pushUrlInQueue;
module.exports.stopFurtherCrawling=  stopFurtherCrawling;

var baseUrl                       = constants.baseUrl;
var maxCrawlingConcurrentRequests = constants.maxCrawlingConcurrentRequests;

var crawlingQueue                 = []; // Queue which has all the Url which need to be crawled 
var stopCrawling                  = false; // Variable to stop the crawling when maxRequests Limit has reached




function initiateCrawling(){
  crawlingQueue.push(baseUrl); // initiating crawling with base url
  logging.trace({event : "initiateCrawling", crawlingQueue : crawlingQueue});
  processCrawling();
  return;
}


function processCrawling(){

  logging.trace({event : "Current Crawling Parameters", crawlingQueue : crawlingQueue, stopCrawling : stopCrawling});

  if(stopCrawling){
    return;
  }

  if(!crawlingQueue[0]){ // not checking length instead checking zeroth element as complexity by this is O(1) instead of O(n)
    return;
  }
  var crawlingLinks = crawlingQueue.splice(0, maxCrawlingConcurrentRequests);
  // Defining max request in maxCrawlingConcurrentRequests variable so that we are not exceeding requests to getting blocked

  logging.trace({event : "processCrawling", crawlingLinks : crawlingLinks, crawlingQueue : crawlingQueue});

  concurrentCrawlingRequests(crawlingLinks);
  return;
}

function concurrentCrawlingRequests(crawlingLinks){
    for(var i=0; i<crawlingLinks.length; i++){
      logging.trace({event : "concurrentCrawlingRequests", crawlingLinks : crawlingLinks[i]});
      crawler.requestWebPage(crawlingLinks[i]); // crawling webPages
    }
  return;
}

function pushUrlInQueue(url) {
  logging.trace({event : "Pushing Url In Queue", url : url});
  crawlingQueue.push(url);
  return;
}

function stopFurtherCrawling() {
  stopCrawling = true;
  return;
}

