#! /bin/bash

#AMI basada en Ubuntu 22.04 LTS basada en EBS para us-east-1 (ami-052efd3df9dad4825)
AMI_ID="ami-052efd3df9dad4825"

#User Data
VPC_ID=`aws ec2 describe-vpcs --output text --filters "Name=tag-value,Values=alucloud$ID-vpc" --query Vpcs[*].VpcId`

echo "VPC ID is $VPC_ID"
PRIVATE_SUBNET_ID=`aws ec2 describe-subnets --output text --filters "Name=tag-value,Values=alucloud$ID-subnet-private1-us-east-1a" --query 'Subnets[*].SubnetId'`

echo "Private Subnet ID for $VPC_ID is $PRIVATE_SUBNET_ID"
SG_ID=`aws ec2 describe-security-groups --output text --filter "Name=group-name,Values=gs-alucloud$ID-vpc-db" --query 'SecurityGroups[*].GroupId'`

echo "Security Group ID for gs-vpc$ID-db is $SG_ID"
DEFAULT_SG_ID=`aws ec2 describe-security-groups --output text --filter Name=group-name,Values=default Name=vpc-id,Values=$VPC_ID --query 'SecurityGroups[*].GroupId'`

echo "Default Security Group ID for gs-vpc$ID-db is $DEFAULT_SG_ID"

# Deploy in private subnet of VPC
MYSQL_INSTANCE_ID=`aws ec2 run-instances --output text --image-id $AMI_ID --key-name alucloud$ID-keypair --security-group-ids $SG_ID $DEFAULT_SG_ID --instance-type t3.micro --subnet-id $PRIVATE_SUBNET_ID --user-data file:///opt/cursoaws/vpc/configure-mysql-cellar.sh --query "Instances[*].InstanceId"`

echo "Instance ID is $MYSQL_INSTANCE_ID"
aws ec2 create-tags --resources $MYSQL_INSTANCE_ID --tags Key=Name,Value=vpc-mysql$ID