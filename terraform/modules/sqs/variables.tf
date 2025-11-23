variable "environment" {
  description = "Environment name"
  type        = string
}

variable "queue_prefix" {
  description = "Prefix for queue names"
  type        = string
  default     = "ledger-core"
}

variable "queue_names" {
  description = "List of queue names to create"
  type        = list(string)
}

variable "max_receive_count" {
  description = "Maximum number of times a message can be received before being moved to DLQ"
  type        = number
  default     = 3
}

