# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/bionic64"
  config.vm.box_check_update = false
  config.vm.network "forwarded_port", guest: 80, host: 80
  config.vm.network "private_network", ip: "192.168.33.44"
  config.vm.synced_folder "./", "/rada"

  config.vm.provider "virtualbox" do |vb|
      vb.name = "rada"
      vb.gui = false
      vb.memory = "2048"
      vb.cpus = 2
   end

   config.vm.provision "shell", path: "bootstrap.sh"
end
