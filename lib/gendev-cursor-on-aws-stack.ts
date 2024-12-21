import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NetworkStack } from './gendev-cursor-on-aws-vpc-stack';
import { Litellm } from './gendev-cursor-on-aws-litellm-stack';

export interface GendevCursorOnAwsStackProps extends cdk.StackProps {
  litellm_key: string;
}

export class GendevCursorOnAwsStack extends cdk.Stack {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: GendevCursorOnAwsStackProps) {
    super(scope, id, props);

    // Create network environment and get VPC
    const network = new NetworkStack(this, "NetworkStack", {});

    const litellm = new Litellm(this, "LitellmStack", {
      vpc: network.vpc
      , litellm_key: props.litellm_key || ""
    });

    // Output the EC2 instance public IP
    new cdk.CfnOutput(this, 'InstancePublicIp', {
      description: 'Public IP address of the EC2 instance',
      value: litellm.litellmEC2.instancePublicIp
    });

    // If you also want the public DNS name
    new cdk.CfnOutput(this, 'InstancePublicDns', {
      description: 'Public DNS name of the EC2 instance',
      value: litellm.litellmEC2.instancePublicDnsName
    });
  }
}

