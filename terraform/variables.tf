variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "ledger_core_db"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}

variable "database_url" {
  description = "Full database connection URL (used for App Runner)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "vpc_id" {
  description = "VPC ID for RDS"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for RDS subnet group"
  type        = list(string)
}

variable "allowed_cidrs" {
  description = "Allowed CIDR blocks for RDS security group"
  type        = list(string)
  default     = []
}

variable "queue_prefix" {
  description = "Prefix for SQS queue names"
  type        = string
  default     = "ledger-core"
}

variable "queue_names" {
  description = "List of SQS queue names to create"
  type        = list(string)
  default     = ["transaction-created"]
}

variable "server_port" {
  description = "Server port for the application"
  type        = number
  default     = 3000
}

variable "bun_version" {
  description = "Bun version to use in Docker build"
  type        = string
  default     = "1.3.0"
}

variable "aws_access_key_id" {
  description = "AWS access key ID"
  type        = string
  sensitive   = true
  default     = ""
}

variable "aws_secret_access_key" {
  description = "AWS secret access key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "sentry_dsn" {
  description = "Sentry DSN for error tracking"
  type        = string
  default     = ""
}

variable "sentry_environment" {
  description = "Sentry environment name"
  type        = string
  default     = "dev"
}

variable "cors_origin" {
  description = "CORS origin for the API"
  type        = string
  default     = "*"
}

variable "aws_cognito_user_pool_id" {
  description = "AWS Cognito User Pool ID"
  type        = string
  default     = ""
}

variable "aws_cognito_client_id" {
  description = "AWS Cognito Client ID"
  type        = string
  default     = ""
}

variable "aws_cognito_client_secret" {
  description = "AWS Cognito Client Secret"
  type        = string
  sensitive   = true
  default     = ""
}

