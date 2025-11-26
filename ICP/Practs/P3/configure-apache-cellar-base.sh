#!/bin/bash -v
amazon-linux-extras enable php7.4
yum clean metadata
#php php-mysql

yum -y install mysql httpd php-cli php-pdo php-devel php-fpm php-json php-mysqlnd
cd /var/www/html
wget https://s3.amazonaws.com/cursocloudaws/cloudformation/cellar-webapp-sql.tgz
tar zxvf cellar-webapp-sql.tgz

#Configure the PHP application"
sed -i s/CELLAR_RDS_HOST/MYSQL_INSTANCE_IP_TAG/g /var/www/html/cellar-webapp-sql/api/index.php
sed -i s/None/All/g /etc/httpd/conf/httpd.conf

sleep 5
service httpd restart