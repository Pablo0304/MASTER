#!/bin/bash -v
# Non interactive installations, as described in:
# http://askubuntu.com/questions/79257/how-do-i-install-mysql-without-a-password-prompt

echo mysql-server mysql-server/root_password password totoro | sudo debconf-set-selections
echo mysql-server mysql-server/root_password_again password totoro | sudo debconf-set-selections

sudo apt-get update
sudo apt-get -y install mysql-server

wget https://s3.amazonaws.com/cursocloudaws/cloudformation/cellar.sql

echo "create database cellar" | mysql -u root -ptotoro
#Create user awsuser with password cloudvlc
echo "CREATE USER 'awsuser' IDENTIFIED WITH mysql_native_password BY 'cloudvlc';" | mysql -u root -ptotoro

#Grant privileges
echo "GRANT ALL PRIVILEGES ON *.* TO 'awsuser' WITH GRANT OPTION;" | mysql -u root -ptotoro

cat cellar.sql | mysql -u awsuser -pcloudvlc cellar