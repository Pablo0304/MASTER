#AMI EBS de Amazon Linux 2 (64-bit) para us-east-1 (ami-05fa00d4c63e32376)
AMI_ID="ami-05fa00d4c63e32376"
PUBLIC_SUBNET_ID=`aws ec2 describe-subnets --output text --filters "Name=tag-value,Values=alucloud$ID-subnet-public1-us-east-1a" --query 'Subnets[*].SubnetId'`

echo "Public Subnet ID is $PUBLIC_SUBNET_ID"
MYSQL_INSTANCE_PRIVATE_IP=`aws ec2 describe-instances --output text --filters "Name=tag-value,Values=vpc-mysql$ID" --query "Reservations[*].Instances[*].NetworkInterfaces[*].PrivateIpAddress"`
SG_ID=`aws ec2 describe-security-groups --output text --filter "Name=group-name,Values=gs-alucloud$ID-vpc-web" --query 'SecurityGroups[*].GroupId'`

echo "Security Group ID is $SG_ID"
cp /opt/cursoaws/vpc/updated/configure-apache-cellar-base.sh $HOME

# sed -i en vez de sed segun la version de sed
sed s/MYSQL_INSTANCE_IP_TAG/$MYSQL_INSTANCE_PRIVATE_IP/g $HOME/configure-apache-cellar-base.sh > $HOME/configure-apache-cellar.sh
WEB_INSTANCE_ID=`aws ec2 run-instances --output text --image-id $AMI_ID --key-name alucloud$ID-keypair --instance-type t3.micro --security-group-ids $SG_ID --subnet-id $PUBLIC_SUBNET_ID --user-data file://$HOME/configure-apache-cellar.sh --associate-public-ip-address --query "Instances[*].InstanceId"`

echo "Instance ID is $WEB_INSTANCE_ID"
aws ec2 create-tags --resources $WEB_INSTANCE_ID --tags
Key=Name,Value=vpc-web$ID