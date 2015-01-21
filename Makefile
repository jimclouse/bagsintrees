#! /usr/bin/env bash
# vim: set ft=shell
SHELL = /bin/bash

default: server node

development: node


server:
	sudo apt-get update; 
	sudo apt-get install -y g++ curl libssl-dev apache2-utils upstart
	sudo apt-get install -y git-core build-essential libssl-dev monit

	# copy over upstart script
	sudo cp upstart-bags.conf /etc/init/

node:
	# install nvm
	curl https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash # first install nvm as root
	su -c "curl https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash" -s /bin/bash ubuntu # then as ubuntu user
	su -c "source ~/.nvm/nvm.sh" -s /bin/bash ubuntu
	su -c "source ~/.nvm/nvm.sh; nvm install 0.10.3" -s /bin/bash ubuntu
	echo "after nvm install"

mysql: 
	sudo apt-get install mysql-server;

application: 
	npm install
	bower install

approuter:
	cd ~ && 
	git clone https://github.com/igroff/approuter.git &&
	cd ~/approuter/ && 
	make

approuter_start:
	cd ~/approuter/ && source ./environment &&
	start_approuter https://github.com/jimclouse/bagsintrees.git 8080 4