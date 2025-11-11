locals {
  container_name      = "fintech-ledger-core-container-${var.environment}"
  container_port      = var.server_port
  ecr_repository_name = "fintech-ledger-core-ecr-${var.environment}"
  ecr_address         = format("%v.dkr.ecr.%v.amazonaws.com", data.aws_caller_identity.this.account_id, data.aws_region.this.name)
}

