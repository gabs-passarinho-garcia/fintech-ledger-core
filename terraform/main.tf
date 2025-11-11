terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
    time = {
      source  = "hashicorp/time"
      version = "~> 0.9"
    }
  }

  backend "s3" {
    # Backend configuration should be provided via backend configuration files
    # See environments/dev/backend.hcl for example
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "fintech-ledger-core"
      Environment = var.environment
      ManagedBy   = "opentofu"
    }
  }
}

data "aws_caller_identity" "this" {}
data "aws_ecr_authorization_token" "this" {}
data "aws_region" "this" {}

provider "docker" {
  registry_auth {
    address  = local.ecr_address
    password = data.aws_ecr_authorization_token.this.password
    username = data.aws_ecr_authorization_token.this.user_name
  }
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  environment     = var.environment
  db_name         = var.db_name
  db_username     = var.db_username
  db_password     = var.db_password
  instance_class  = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  vpc_id          = var.vpc_id
  subnet_ids      = var.subnet_ids
  allowed_cidrs   = var.allowed_cidrs
}

# SQS Module
module "sqs" {
  source = "./modules/sqs"

  environment   = var.environment
  queue_prefix  = var.queue_prefix
  queue_names   = var.queue_names
}


