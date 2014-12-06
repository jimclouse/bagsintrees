#! /usr/bin/env bash
# vim: set ft=shell
SHELL = /bin/bash

default: server node redis

development: node redis


server:
	sudo apt-get update; 
	sudo apt-get install -y g++ curl libssl-dev apache2-utils upstart
	sudo apt-get install -y git-core build-essential libssl-dev monit

	# copy over upstart script
	sudo cp upstart-bags.conf /etc/init/

node:
	# install nvm
	su -c "curl https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash" -s /bin/bash ubuntu
	su -c "source ~/.nvm/nvm.sh" -s /bin/bash ubuntu
	su -c "source ~/.nvm/nvm.sh; nvm install 0.10.3" -s /bin/bash ubuntu
	echo "after nvm install"

mysql: 
	sudo apt-get install mysql-server;

redis:
	curl -O http://download.redis.io/releases/redis-2.8.8.tar.gz
	tar xzf redis-2.8.8.tar.gz
	cd redis-2.8.8; $(MAKE)


application: 
	npm install
	bower install