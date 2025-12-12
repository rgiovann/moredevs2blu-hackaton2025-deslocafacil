###############################################
# SECURITY GROUP
###############################################

resource "aws_security_group" "obs_sg" {
  name        = "leopoldo-hackaton-sg"
  description = "Deploy projeto grupo 03"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Srping-Boot"
    from_port   = 8443
    to_port     = 8443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Https"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "All egress"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

###############################################
# IAM ROLE PARA A EC2
###############################################

# Política de confiança da EC2 (quem pode assumir essa role)
data "aws_iam_policy_document" "ec2_assume_role" {
  statement {
    effect = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

# Criação da role
resource "aws_iam_role" "ec2_ssm_role" {
  name               = "ec2-ssm-access-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role.json
}

###############################################
# POLICY PARA LER OS SECRETS DO SSM
###############################################
data "aws_iam_policy_document" "ssm_access_policy" {
  statement {
    effect = "Allow"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParameterHistory"
    ]

    # Restrito ao prefixo dos seus secrets
    resources = [
      "arn:aws:ssm:*:*:parameter/backend/ssl/*"
    ]
  }

  # Necessário para decrypt
  statement {
    effect = "Allow"
    actions = [
      "kms:Decrypt"
    ]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ssm_access_policy" {
  name   = "ec2-ssm-ssl-policy"
  policy = data.aws_iam_policy_document.ssm_access_policy.json
}

# Anexa a policy à role da EC2
resource "aws_iam_role_policy_attachment" "attach_ssm_policy" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = aws_iam_policy.ssm_access_policy.arn
}

# Anexa a managed policy AmazonSSMReadOnlyAccess (para leitura ampla de SSM)
resource "aws_iam_role_policy_attachment" "attach_ssm_readonly" {
  role       = aws_iam_role.ec2_ssm_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

###############################################
# INSTANCE PROFILE (necessário para EC2 usar a IAM Role)
###############################################
resource "aws_iam_instance_profile" "ec2_ssm_profile" {
  name = "ec2-ssm-profile"
  role = aws_iam_role.ec2_ssm_role.name
}


###############################################
# EC2 INSTANCE (agora com instance_profile)
###############################################
resource "aws_instance" "obs_ec2" {
  ami = "ami-011e7b514a4f15472"        // debian 12
  instance_type               = "t3.small"
  subnet_id                   = var.subnet_id
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.obs_sg.id]
  associate_public_ip_address = true

  # Aqui está o instance profile que libera acesso SSM
  iam_instance_profile = aws_iam_instance_profile.ec2_ssm_profile.name

  user_data = file("${path.module}/user-data.sh")

  depends_on = [
    aws_iam_instance_profile.ec2_ssm_profile,
    aws_iam_role_policy_attachment.attach_ssm_policy,
    aws_iam_role_policy_attachment.attach_ssm_readonly
  ]

  tags = {
    Name = "leopoldo-ec2-hackaton-group-03"
    Project = "devs2blu-hackaton-2025"

  }
}
