import {
  Stack,
  StackProps,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_apigateway as apigateway,
} from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    let allowedHeaders = apigateway.Cors.DEFAULT_HEADERS;
    allowedHeaders.push("userId");
    const apigw = new apigateway.RestApi(this, "mockApigateway", {
      restApiName: "mockApigateway",
      deployOptions: {
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: allowedHeaders,
        statusCode: 200,
      },
    });
    const taskRoot = apigw.root.addResource("task", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: allowedHeaders,
        statusCode: 200,
      },
    });
    const lambdaRole = new iam.Role(this, "mockLambdaRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "apigateway",
          "arn:aws:iam::aws:policy/AmazonAPIGatewayInvokeFullAccess"
        ),
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "dynamodb",
          "arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"
        ),
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          "lambda",
          "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
        ),
      ],
      description: "Basic Lambda Role",
    });
    const fetchTaskLambdaIntegration = createPythonLambdaIntegration(
      this,
      "mockFetchTask",
      lambdaRole,
      "fetch_task"
    );
    taskRoot.addMethod("GET", fetchTaskLambdaIntegration);
    const registerTaskLambdaIntegration = createPythonLambdaIntegration(
      this,
      "mockRegisterTask",
      lambdaRole,
      "register_task"
    );
    taskRoot.addMethod("POST", registerTaskLambdaIntegration);
    const updateTaskLambdaIntegration = createPythonLambdaIntegration(
      this,
      "mockUpdateTask",
      lambdaRole,
      "update_task"
    );
    taskRoot.addMethod("PUT", updateTaskLambdaIntegration);
  }
}

const createPythonLambdaIntegration = (
  scope: Construct,
  name: string,
  role: iam.Role,
  dirname: string
) => {
  const code = lambda.Code.fromAsset(__dirname + `/../lambdas/${dirname}`);
  const func = new lambda.Function(scope, name, {
    functionName: name,
    runtime: lambda.Runtime.PYTHON_3_9,
    handler: "index.handler",
    code: code,
    role: role,
  });
  const integration = new apigateway.LambdaIntegration(func);
  return integration;
};
