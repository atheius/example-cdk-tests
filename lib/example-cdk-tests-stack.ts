import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";

export class ExampleCdkTestsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, "ExampleBucket", {
      bucketName: "example-bucket",
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Uncomment to check tests fail on public bucket

    // new s3.Bucket(this, "ExamplePublicBucket", {
    //   bucketName: "example-public-bucket",
    //   publicReadAccess: true,
    // });

    new iam.Role(this, "ExampleRole", {
      assumedBy: new iam.AnyPrincipal(),
      description: "An example IAM role in AWS CDK",
      inlinePolicies: {
        example: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["s3:GetObject"],
              resources: [
                "arn:aws:s3:::example-bucket",
                "arn:aws:s3:::example-bucket/*",
              ],
            }),
          ],
        }),
      },
    });

    // Uncomment to check tests fail on wilcard resources

    // new iam.Role(this, "ExampleRoleWildcardResources", {
    //   assumedBy: new iam.AnyPrincipal(),
    //   description: "An example IAM role in AWS CDK",
    //   inlinePolicies: {
    //     example: new iam.PolicyDocument({
    //       statements: [
    //         new iam.PolicyStatement({
    //           actions: ["s3:GetObject"],
    //           resources: ["*"],
    //         }),
    //       ],
    //     }),
    //   },
    // });
  }
}
