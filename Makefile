#! /usr/bin/env bash
# vim: set ft=shell
SHELL = /bin/bash

default: server redis

server:
	apt-get update; 
	sudo apt-get install g++ curl libssl-dev apache2-utils upstart
	sudo apt-get install git-core build-essential libssl-dev monit

	#git clone https://github.com/npm/npm.git;
	#cd npm; make install;

	git clone git://github.com/ry/node.git
	cd node && ./configure && make && make install

	# install nvm
	curl https://raw.githubusercontent.com/creationix/nvm/v0.17.1/install.sh | bash

	# not sure we need nginx anymore: apt-get install -y nginx

	source ~/.nvm/nvm.sh
	nvm use 0.10.26
	
redis:
	curl -O http://download.redis.io/releases/redis-2.8.8.tar.gz
	tar xzf redis-2.8.8.tar.gz
	cd redis-2.8.8; $(MAKE)

application: 
	npm install
	bower install