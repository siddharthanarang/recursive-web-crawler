'use strict';

import constants from './constants';
import crawler   from './crawler';
import logging   from '../logging';

const baseUrl                       = constants.baseUrl;
const maxCrawlingConcurrentRequests = constants.maxCrawlingConcurrentRequests;

let crawlingQueue                 = []; // Queue which has all the Url which need to be crawled
let stopCrawling                  = false; // Variable to stop the crawling when maxRequests Limit has reached




const initiateCrawling = () => {
  crawlingQueue.push(baseUrl); // initiating crawling with base url
  logging.trace({event : "initiateCrawling", crawlingQueue : crawlingQueue});
  processCrawling();
  return;
};


const processCrawling = () => {

  logging.trace({event : "Current Crawling Parameters", crawlingQueue : crawlingQueue, stopCrawling : stopCrawling});

  if(stopCrawling){
    return;
  }

  if(!crawlingQueue[0]){ // not checking length instead checking zeroth element as complexity by this is O(1) instead of O(n)
    return;
  }
  let crawlingLinks = crawlingQueue.splice(0, maxCrawlingConcurrentRequests);
  // Defining max request in maxCrawlingConcurrentRequests variable so that we are not exceeding requests to getting blocked

  logging.trace({event : "processCrawling", crawlingLinks : crawlingLinks, crawlingQueue : crawlingQueue});

  concurrentCrawlingRequests(crawlingLinks);
  return;
};

const concurrentCrawlingRequests = (crawlingLinks) => {
    for(let i=0; i<crawlingLinks.length; i++){
      logging.trace({event : "concurrentCrawlingRequests", crawlingLinks : crawlingLinks[i]});
      crawler.requestWebPage(crawlingLinks[i]); // crawling webPages
    }
  return;
};

const pushUrlInQueue = (url) => {
  logging.trace({event : "Pushing Url In Queue", url : url});
  crawlingQueue.push(url);
  return;
};

const stopFurtherCrawling = () => {
  stopCrawling = true;
  return;
};

export default {initiateCrawling, processCrawling, pushUrlInQueue, stopFurtherCrawling};