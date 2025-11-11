terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

resource "aws_sqs_queue" "queues" {
  for_each = toset(var.queue_names)

  name                      = "${var.queue_prefix}-${each.value}-${var.environment}"
  message_retention_seconds  = 345600 # 4 days
  visibility_timeout_seconds = 30
  receive_wait_time_seconds  = 0 # Short polling

  tags = {
    Name        = "${var.queue_prefix}-${each.value}-${var.environment}"
    Environment = var.environment
  }
}

output "queue_urls" {
  description = "Map of queue names to queue URLs"
  value = {
    for name, queue in aws_sqs_queue.queues : name => queue.url
  }
}

output "queue_arns" {
  description = "Map of queue names to queue ARNs"
  value = {
    for name, queue in aws_sqs_queue.queues : name => queue.arn
  }
}

