# GenDev Cursor on AWS: LiteLLM API Deployment with CDK

This project deploys a LiteLLM API on AWS using the Cloud Development Kit (CDK).

The GenDev Cursor on AWS project sets up a scalable and secure infrastructure for running a LiteLLM API on Amazon Web Services. It leverages AWS CDK to define and provision the necessary resources, including networking components, EC2 instances, and security configurations.

Key features of this project include:
- Automated deployment of a LiteLLM API server on an EC2 instance
- VPC configuration for network isolation and security
- Integration with AWS Bedrock for AI model access
- Customizable configuration for LiteLLM models and parameters
- Easy setup and deployment using CDK

## Repository Structure

- `bin/`: Contains the entry point for the CDK application
  - `gendev-cursor-on-aws.ts`: Main CDK application file
- `lib/`: Core implementation of the CDK stacks
  - `gendev-cursor-on-aws-litellm-stack.ts`: LiteLLM EC2 instance stack
  - `gendev-cursor-on-aws-stack.ts`: Main stack orchestrating the deployment
  - `gendev-cursor-on-aws-vpc-stack.ts`: VPC network stack
- `test/`: Contains test files for the CDK stacks
- `cdk.json`: CDK configuration file
- `gen_env.sh`: Script to generate the `.env` file with LiteLLM API key
- `package.json`: Node.js project configuration and dependencies
- `tsconfig.json`: TypeScript compiler configuration

## Usage Instructions

### Prerequisites

- Node.js (v14.x or later)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI (v2.x)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd gendev-cursor-on-aws
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Generate the `.env` file:
   ```
   ./gen_env.sh
   ```
   Note: Edit the `gen_env.sh` script to set your actual LiteLLM API key.

### Deployment

1. Synthesize the CloudFormation template:
   ```
   cdk synth
   ```

2. Deploy the stack:
   ```
   cdk deploy
   ```

### Configuration

The LiteLLM configuration is defined in the `lib/gendev-cursor-on-aws-litellm-stack.ts` file. You can modify the `config.yaml` content in the user data script to adjust model configurations, such as adding or removing models, changing parameters, etc.

### Testing

To run the tests:

```
npm test
```

Note: The current test suite is commented out and needs to be implemented based on your specific requirements.

## Data Flow

The LiteLLM API deployed by this project handles requests as follows:

1. Client sends a request to the EC2 instance's public IP or DNS.
2. The request is received by the LiteLLM server running in a Docker container on the EC2 instance.
3. LiteLLM processes the request, using the configuration defined in `config.yaml`.
4. If the request requires AI model interaction, LiteLLM communicates with AWS Bedrock using the instance's IAM role.
5. The response is sent back to the client.

```
[Client] <-> [EC2 Instance (LiteLLM Docker)] <-> [AWS Bedrock]
```

Note: Ensure proper security measures are in place to protect the API endpoint and manage access to the EC2 instance.

## Infrastructure

The project defines the following key AWS resources:

### VPC
- A custom VPC for network isolation

### EC2
- Instance Type: t3.large
- AMI: Latest Amazon Linux 2023
- Security Group: Allows inbound traffic on port 80
- IAM Role: Grants access to AWS Bedrock and Systems Manager

### IAM
- Role: litellm-ec2-{region}
  - Policies: AmazonBedrockFullAccess, AmazonSSMManagedInstanceCore

### Security Group
- Allows inbound HTTP traffic (port 80)
- Allows all outbound traffic

## Troubleshooting

Common issues and solutions:

1. Deployment fails due to missing `.env` file:
   - Ensure you've run the `gen_env.sh` script to generate the `.env` file.
   - Verify that the `LITELLM_KEY` is correctly set in the `.env` file.

2. EC2 instance is not accessible:
   - Check the security group rules to ensure port 80 is open for inbound traffic.
   - Verify that the EC2 instance is in a running state.
   - Check the EC2 instance logs using AWS Systems Manager Session Manager for any startup errors.

3. LiteLLM API is not responding:
   - SSH into the EC2 instance and check the Docker container logs:
     ```
     docker logs $(docker ps -q)
     ```
   - Ensure the LiteLLM configuration in `config.yaml` is correct.

For more detailed debugging:

1. Enable verbose logging in the LiteLLM Docker command by adding the `--verbose` flag.
2. Check CloudWatch Logs if you've set up logging for the EC2 instance.
3. Use AWS Systems Manager Session Manager to access the EC2 instance without SSH for troubleshooting.