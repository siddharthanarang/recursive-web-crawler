CREATE SCHEMA `webCrawler` ;


CREATE TABLE `webCrawler`.`tb_url_store` (
  `url_id` INT NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `url_count` INT NOT NULL,
  `params` JSON NULL,
  PRIMARY KEY (`url_id`),
  UNIQUE INDEX `url_UNIQUE` (`url` ASC));

