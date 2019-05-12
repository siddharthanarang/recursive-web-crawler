var Promise                       = require('bluebird');

var constants                     = require('./constants');
var crawler                       = require('./crawler');
var logging                       = require('../logging');

module.exports.initiateCrawling   =  initiateCrawling;
module.exports.processCrawling    =  processCrawling;
module.exports.pushUrlInQueue     =  pushUrlInQueue;
module.exports.stopFurtherCrawling=  stopFurtherCrawling;

var baseUrl                       = constants.baseUrl;
var maxCrawlingConcurrentRequests = constants.maxCrawlingConcurrentRequests;
var nextCrawlingInterval          = constants.nextCrawlingInterval; // delay time in milli seconds

var crawlingQueue                 = []; // Queue which has all the Url which need to be crawled 
var isCrawlingRunning             = false; // Variable maintaining current state of crawling
var stopCrawling                  = false; // Variable to stop the crawling when maxRequests Limit has reached




function initiateCrawling(){
  crawlingQueue.push(baseUrl); // initiating crawling with base url
  logging.trace({event : "initiateCrawling", crawlingQueue : crawlingQueue});
  processCrawling();
  return;
}


function processCrawling(){

  logging.trace({event : "Current Crawling Parameters", isCrawlingRunning : isCrawlingRunning,
    crawlingQueue : crawlingQueue, stopCrawling : stopCrawling});

  if(stopCrawling){
    return;
  }

  if(isCrawlingRunning){
    return; // if crawling loop is already running then not run it again
  }
  if(!crawlingQueue[0]){ // not checking length instead checking zeroth element as complexity by this is O(1) instead of O(n)
    isCrawlingRunning = false; // if crawlingQueue is empty then nothing left to crawl
    return;
  }
  isCrawlingRunning = true;
  var crawlingLinks = crawlingQueue.splice(0, maxCrawlingConcurrentRequests);
  // Defining max request in maxCrawlingConcurrentRequests variable so that we are not exceeding requests to getting blocked

  logging.trace({event : "processCrawling", isCrawlingRunning : isCrawlingRunning, 
    crawlingLinks : crawlingLinks, crawlingQueue : crawlingQueue});

  concurrentCrawlingRequests(crawlingLinks);
  return;
}

function concurrentCrawlingRequests(crawlingLinks){
  Promise.coroutine(function*(){
    var  crawlingRequests = [];
    for(var i=0; i<crawlingLinks.length; i++){
      logging.trace({event : "concurrentCrawlingRequests", crawlingLinks : crawlingLinks[i]});
      crawlingRequests.push(crawler.requestWebPage(crawlingLinks[i])); // crawling webPages in batches
    }
    yield Promise.all(crawlingRequests);
    addDelayAndProcessCrawling();
  })().then((result)=>{
    return;
  },(error) =>{
    return;
  });
}

function addDelayAndProcessCrawling() {
  
  logging.trace({event : "addDelayAndProcessCrawling"});

  setTimeout(function () { // adding a delay equal to nextCrawlingInterval so that we maintain sufficient 
                           // time gap between next batch
    
    logging.trace({event : "Delay Of Next Request Finished"});
    isCrawlingRunning = false;
    processCrawling(); // Calling crawl function after that delay
  }, nextCrawlingInterval)
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

