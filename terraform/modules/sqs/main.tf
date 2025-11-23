terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Dead Letter Queues
resource "aws_sqs_queue" "dlq" {
  for_each = toset(var.queue_names)

  name                      = "${var.queue_prefix}-${each.value}-dlq-${var.environment}"
  message_retention_seconds = 1209600 # 14 days (AWS default for DLQ)

  tags = {
    Name        = "${var.queue_prefix}-${each.value}-dlq-${var.environment}"
    Environment = var.environment
    Type        = "DLQ"
  }
}

# Main queues with redrive policy
resource "aws_sqs_queue" "queues" {
  for_each = toset(var.queue_names)

  name                      = "${var.queue_prefix}-${each.value}-${var.environment}"
  message_retention_seconds  = 345600 # 4 days
  visibility_timeout_seconds = 30
  receive_wait_time_seconds  = 0 # Short polling

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq[each.value].arn
    maxReceiveCount     = var.max_receive_count
  })

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

output "dlq_queue_urls" {
  description = "Map of queue names to DLQ URLs"
  value = {
    for name, dlq in aws_sqs_queue.dlq : name => dlq.url
  }
}

output "dlq_queue_arns" {
  description = "Map of queue names to DLQ ARNs"
  value = {
    for name, dlq in aws_sqs_queue.dlq : name => dlq.arn
  }
}

