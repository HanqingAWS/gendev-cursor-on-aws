import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from 'constructs';

export interface LitellmStackProps extends cdk.NestedStackProps {
    vpc: ec2.Vpc,
    litellm_key: string,
}

export class Litellm extends cdk.NestedStack {
    public readonly litellmEC2: ec2.Instance;
  constructor(scope: Construct, id: string, props: LitellmStackProps) {
    super(scope, id, props);
    
    const litellmRole = new iam.Role(this, 'litellm-role', {
        roleName: `litellm-ec2-${cdk.Stack.of(this).region}`,
        assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
        managedPolicies: [
            iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonBedrockFullAccess'),
            iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        ],
    });

    const securityGroup = new ec2.SecurityGroup(this, 'litellm-ec2-sg', {
        vpc: props.vpc,
        description: 'Litellm Broswer Security Group',
        allowAllOutbound: true   // 允许所有出站流量
    });
    // 允许 80 访问
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'allow http access');

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
        "yum update -y",
        "yum install docker -y",
        "systemctl enable docker",
        "systemctl start docker",
        "mkdir -p /data/litellm",
        "cd /data/litellm",
        "touch /data/litellm/config.yaml",
        "cat > /data/litellm/config.yaml <<EOF",
        "model_list:",
        "  - model_name: bedrock-sonnet-3-5-v2",
        "    litellm_params:",
        `      model: "anthropic.claude-3-5-sonnet-20241022-v2:0"`,
        `      aws_region_name: "${this.region}"`,
        "      max_tokens: 4096",
        "      temperature: 0",
        "  - model_name: bedrock-claude-3-5-haiku",
        "    litellm_params:",
        `      model: "anthropic.claude-3-5-haiku-20241022-v1:0"`,
        `      aws_region_name: "${this.region}"`,
        "      max_tokens: 4096",
        "      temperature: 0",
        "  - model_name: bedrock-claude-3-haiku",
        "    litellm_params:",
        `      model: "anthropic.claude-3-haiku-20240307-v1:0"`,
        `      aws_region_name: "${this.region}"`,
        "      max_tokens: 4096",
        "      temperature: 0",
        "EOF",
        "docker run --restart=always -d \\",
        "-v /data/litellm/config.yaml:/app/config.yaml \\",
        "-e STORE_MODEL_IN_DB=True \\",
        `-e LITELLM_MASTER_KEY="${props.litellm_key}" \\`,
        "-p 80:4000 \\",
        "ghcr.io/berriai/litellm:main-v1.52.9 \\",
        "--config /app/config.yaml --detailed_debug"
    );

    this.litellmEC2 = new ec2.Instance(this, 'litellmEC2', {
        instanceName: 'litellm Instance',
        instanceType: new ec2.InstanceType('t3.large'), // 选择实例类型
        machineImage: ec2.MachineImage.latestAmazonLinux2023(), // 使用最新的 Amazon Linux AMI
        vpc: props.vpc,
        securityGroup,
        vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC }, 
        role: litellmRole,
        blockDevices: [{
            deviceName: '/dev/xvda',
            volume: ec2.BlockDeviceVolume.ebs(8, {
                volumeType: ec2.EbsDeviceVolumeType.GP3,
            }),
        }],
        userData: userData,
    });

    new cdk.CfnOutput(this, 'litellmEC2PublicIp', {
        description: 'Public IP address of the EC2 instance',
        value: this.litellmEC2.instancePublicIp
    });
  }
}
