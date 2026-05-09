terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "sa-bookings-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "af-south-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region"
  default     = "af-south-1"
}

variable "environment" {
  description = "Deployment environment"
  default     = "production"
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = { Name = "sa-bookings-${var.environment}" }
}

# Public subnets
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = "${var.aws_region}${count.index == 0 ? "a" : "b"}"
  map_public_ip_on_launch = true
  tags = { Name = "sa-bookings-public-${count.index}" }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "sa-bookings-${var.environment}"
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# ECS Task Definition - Backend
resource "aws_ecs_task_definition" "backend" {
  family                   = "sa-bookings-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name  = "backend"
      image = "ghcr.io/your-org/sa-bookings/backend:latest"
      essential = true
      portMappings = [{ containerPort = 4000, protocol = "tcp" }]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "DB_HOST", value = aws_db_instance.postgres.address },
        { name = "REDIS_HOST", value = aws_elasticache_cluster.redis.cache_nodes[0].address }
      ]
      secrets = [
        { name = "DB_PASSWORD", valueFrom = aws_secretsmanager_secret.db_password.arn },
        { name = "JWT_SECRET", valueFrom = aws_secretsmanager_secret.jwt_secret.arn },
        { name = "STRIPE_SECRET_KEY", valueFrom = aws_secretsmanager_secret.stripe_key.arn }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/sa-bookings"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier           = "sa-bookings-${var.environment}"
  engine               = "postgres"
  engine_version       = "16.3"
  instance_class       = "db.t3.medium"
  allocated_storage    = 50
  db_name              = "sa_bookings"
  username             = "postgres"
  password             = random_password.db_password.result
  skip_final_snapshot  = false
  backup_retention_period = 30
  multi_az             = true
  storage_encrypted    = true
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name = aws_db_subnet_group.main.name
  tags = { Name = "sa-bookings-${var.environment}" }
}

# ElastiCache Redis
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "sa-bookings-${var.environment}"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.redis.id]
  subnet_group_name    = aws_elasticache_subnet_group.main.name
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "sa-bookings-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
}

resource "aws_lb_target_group" "backend" {
  name        = "sa-bookings-backend-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"
  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.certificate_arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Outputs
output "alb_dns_name" {
  value = aws_lb.main.dns_name
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}
