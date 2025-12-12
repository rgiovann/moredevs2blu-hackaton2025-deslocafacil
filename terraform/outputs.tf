# -----------------------------------------------------------
# Saídas principais do ambiente
# -----------------------------------------------------------

# IP público da EC2
output "ec2_public_ip" {
  value = aws_instance.obs_ec2.public_ip
}

# ID da instância (útil para debug e exclusão manual)
output "ec2_instance_id" {
  value = aws_instance.obs_ec2.id
}

# ID do Security Group
output "security_group_id" {
  value = aws_security_group.obs_sg.id
}

# -----------------------------------------------------------
# URLs dos serviços expostos (para ver rapidamente no console)
# -----------------------------------------------------------

output "grafana_url" {
  value = "http://${aws_instance.obs_ec2.public_ip}:3300"
}

output "prometheus_url" {
  value = "http://${aws_instance.obs_ec2.public_ip}:9090"
}

# -----------------------------------------------------------
# Outputs relacionados à IAM (úteis para manutenção)
# -----------------------------------------------------------

# Nome da IAM Role vinculada à EC2
output "ec2_iam_role_name" {
  value = aws_iam_role.ec2_ssm_role.name
}

output "ec2_instance_profile_name" {
  value = aws_iam_instance_profile.ec2_ssm_profile.name
}

# Política customizada criada para acesso ao SSM
output "ec2_ssm_policy_name" {
  value = aws_iam_policy.ssm_access_policy.name
}

# ARN da política (caso precise checar permissões pelo console)
output "ec2_ssm_policy_arn" {
  value = aws_iam_policy.ssm_access_policy.arn
}

