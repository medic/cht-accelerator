# Following CHT's docs
# https://github.com/medic/cht-core/blob/master/DEVELOPMENT.md

# update packages
sudo apt-get update

# nginx setup
# https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04
sudo apt install -y nginx
sudo ufw allow 'Nginx Full'
sudo ufw status
systemctl status nginx

# node setup
# https://linuxize.com/post/how-to-install-node-js-on-ubuntu-18.04/
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v

# CouchDb setup
# https://docs.couchdb.org/en/2.3.1/install/unix.html
echo "deb https://apache.bintray.com/couchdb-deb bionic main" \
    | sudo tee -a /etc/apt/sources.list
curl -L https://couchdb.apache.org/repo/bintray-pubkey.asc \
    | sudo apt-key add 
sudo apt-get update && sudo apt-get install -y couchdb
sudo systemctl enable couchdb
sudo systemctl status couchdb
curl http://admin:12mpaka10@127.0.0.1:5984

# xsltproc setup
sudo apt-get install -y xsltproc

# python 2.7 setup
sudo apt install -y python-minimal python-pip

# Environment variables
# export COUCH_URL=http://admin:12mpaka10@localhost:5984/medic
export COUCH_URL=http://admin:12mpaka10@localhost:5984/medic
export COUCH_NODE_NAME=couchdb@127.0.0.1

# Install git
sudo apt install -y git
git config --global user.name "klurdy"
git config --global user.email "info@klurdy.com"

# Install grunt
npm install -g grunt

# Install pm2
npm install -g pm2

# install medic conf
npm install -g medic-conf
sudo python -m pip install git+https://github.com/medic/pyxform.git@medic-conf-1.17#egg=pyxform-medic
eval "$(medic-conf --shell-completion=bash)"

# Install NX
sudo npm i -g @nrwl/nx @nrwl/nest nx @nrwl/schematics

# Build the web app
cd ~/
git clone https://github.com/klurdy/rada
cd rada
# npm ci

# Initialize custom nx app
cd ~/rada/custom
npm install

# Deploy the web app
# grunt

# Start medic api
# grunt dev-api

# Start medic sentinel
# grunt dev-sentinel

# Start rada api
# cd ~/rada/custom
# nx 