#! /bin/bash

VPC_ID=`aws ec2 describe-vpcs --filters "Name=tag-value,Values=alucloud$ID-vpc" --query 'Vpcs[*].VpcId' --output text`

echo "VPC ID for alucloud$ID-vpc is $VPC_ID"

SG_BACKEND_ID=`aws ec2 create-security-group --group-name "gs-alucloud$ID-vpc-db" --description 'Puertos 22 (ssh) y 3306 (MySQL Server) abiertos' --vpc-id $VPC_ID --query 'GroupId' --output text`

echo "Creating Security Group (Backend): $SG_BACKEND_ID"

aws ec2 authorize-security-group-ingress --group-id $SG_BACKEND_ID --protocol tcp --port 22 --cidr 10.0.0.0/20
aws ec2 authorize-security-group-ingress --group-id $SG_BACKEND_ID --protocol tcp --port 3306 --cidr 10.0.0.0/20
SG_FRONTEND_ID=`aws ec2 create-security-group --group-name "gs-alucloud$ID-vpc-web" --description 'Puertos 22 (ssh) y 80 (http) abiertos' --vpc-id $VPC_ID --query 'GroupId' --output text`

echo "Creating Security Group (Frontend): $SG_FRONTEND_ID"
aws ec2 authorize-security-group-ingress --group-id $SG_FRONTEND_ID --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $SG_FRONTEND_ID --protocol tcp --port 80 --cidr 0.0.0.0/0