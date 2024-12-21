#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { GendevCursorOnAwsStack } from '../lib/gendev-cursor-on-aws-stack';
import * as fs from 'fs';
import * as path from 'path';

const app = new cdk.App();

// Function to load and parse environment variables from .env file
// Reads the file, processes each line, and returns key-value pairs
// Skips comments and empty lines
// Handles values that may contain = signs
// Throws error if .env file is missing
function loadEnvFile(): { [key: string]: string } {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found. Please create one based on the template.');
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: { [key: string]: string } = {};

  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}
// Load environment variables from .env file
const envVars = loadEnvFile();

// Get configuration values
const litellm_key = envVars['LITELLM_KEY']|| "sk-123";


new GendevCursorOnAwsStack(app, 'GendevCursorOnAwsStack', {
  litellm_key,
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  // env:{ region:'us-west-2'}

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});