module "ecr" {
  source  = "terraform-aws-modules/ecr/aws"
  version = "2.3.0"

  repository_force_delete   = true
  repository_name           = local.ecr_repository_name
  repository_lifecycle_policy = jsonencode({
    rules = [{
      action       = { type = "expire" }
      description  = "Delete all images except a handful of the newest images"
      rulePriority = 1
      selection = {
        countNumber = 3
        countType   = "imageCountMoreThan"
        tagStatus   = "any"
      }
    }]
  })
}

resource "docker_image" "this" {
  name = format("%v:%v", module.ecr.repository_url, formatdate("YYYY-MM-DD'T'hh-mm-ss", timestamp()))

  build {
    context    = "../"
    build_args = {
      APP_ENV            = var.environment
      SERVER_PORT        = local.container_port
      BUN_VERSION        = var.bun_version
      DATABASE_URL       = var.database_url
      SENTRY_DSN         = var.sentry_dsn
      SENTRY_ENVIRONMENT = var.sentry_environment
    }
  }
}

resource "docker_registry_image" "this" {
  keep_remotely = true
  name          = resource.docker_image.this.name
}

resource "aws_iam_role" "fintech-ledger-core-role" {
  name               = "fintech-ledger-core-role-${var.environment}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect = "Allow",
      Principal = { Service = "build.apprunner.amazonaws.com" },
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "fintech-ledger-core-policy" {
  role       = aws_iam_role.fintech-ledger-core-role.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "time_sleep" "wait_role_create" {
  depends_on      = [aws_iam_role.fintech-ledger-core-role]
  create_duration = "60s"
}

resource "aws_apprunner_observability_configuration" "fintech_ledger_core_observability" {
  observability_configuration_name = "fintech-ledger-core-observability-${var.environment}"

  trace_configuration {
    vendor = "AWSXRAY"
  }
}

resource "aws_apprunner_service" "fintech_ledger_core_app_runner" {
  depends_on   = [time_sleep.wait_role_create]
  service_name = "fintech-ledger-core-${var.environment}"

  source_configuration {
    authentication_configuration {
      access_role_arn = aws_iam_role.fintech-ledger-core-role.arn
    }
    image_repository {
      image_identifier      = docker_registry_image.this.name
      image_repository_type = "ECR"
      image_configuration {
        port = local.container_port
        runtime_environment_variables = {
          APP_ENV                    = var.environment
          AWS_ACCESS_KEY_ID          = var.aws_access_key_id
          AWS_SECRET_ACCESS_KEY      = var.aws_secret_access_key
          AWS_REGION                 = var.aws_region
          DATABASE_URL               = var.database_url
          SERVER_PORT                = tostring(local.container_port)
          CORS_ORIGIN                = var.cors_origin
          SENTRY_DSN                 = var.sentry_dsn
          SENTRY_ENVIRONMENT         = var.sentry_environment
          LOCAL_DEVELOPMENT          = "false"
          LOG_LEVEL                  = "info"
          QUEUE_PREFIX               = var.queue_prefix
          AWS_COGNITO_USER_POOL_ID  = var.aws_cognito_user_pool_id
          AWS_COGNITO_CLIENT_ID      = var.aws_cognito_client_id
          AWS_COGNITO_CLIENT_SECRET  = var.aws_cognito_client_secret
        }
      }
    }
  }

  observability_configuration {
    observability_enabled          = true
    observability_configuration_arn = aws_apprunner_observability_configuration.fintech_ledger_core_observability.arn
  }
}

