output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
}

output "sqs_queue_urls" {
  description = "SQS queue URLs"
  value       = module.sqs.queue_urls
}

output "app_runner_service_url" {
  description = "App Runner service URL"
  value       = aws_apprunner_service.fintech_ledger_core_app_runner.service_url
}

output "app_runner_service_arn" {
  description = "App Runner service ARN"
  value       = aws_apprunner_service.fintech_ledger_core_app_runner.arn
}

output "ecr_repository_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

