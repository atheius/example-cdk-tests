import * as cdk from "aws-cdk-lib";
import { Template, Match, Capture } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as ExampleCdkTests from "../lib/example-cdk-tests-stack";

const app = new cdk.App();
const stack = new ExampleCdkTests.ExampleCdkTestsStack(app, "ExampleStack");
const template = Template.fromStack(stack);

const convertToPascalCase = (inputObject: Object) =>
  Object.entries(inputObject).reduce(
    (acc: { [key: string]: string }, [k, v]) => {
      acc[k[0].toUpperCase() + k.substring(1)] = v;
      return acc;
    },
    {}
  );

test("Should contain a bucket named 'example-bucket'", () => {
  template.findResources("AWS::S3::Bucket", {
    Name: "example-bucket",
  });
});

test("S3 buckets should always block public access", () => {
  const bucketConfigCapture = new Capture();

  template.findResources("AWS::S3::Bucket", {
    Properties: bucketConfigCapture,
  });

  if (bucketConfigCapture._captured.length === 0) {
    return;
  }

  do {
    expect(bucketConfigCapture.asObject()).toHaveProperty(
      "PublicAccessBlockConfiguration",
      // We have to convert properties to Pascal case to match CloudFormation
      convertToPascalCase(s3.BlockPublicAccess.BLOCK_ALL)
    );
  } while (bucketConfigCapture.next());
});

test("IAM roles should not contain policies that allow actions on all resources", () => {
  const policyResourcesCapture = new Capture();

  template.hasResourceProperties(
    "AWS::IAM::Role",
    Match.objectLike({
      Policies: policyResourcesCapture,
    })
  );

  if (policyResourcesCapture._captured.length === 0) {
    return;
  }

  do {
    for (const { PolicyDocument } of policyResourcesCapture.asArray()) {
      for (const { Resource, Effect } of PolicyDocument.Statement) {
        if (Effect === "Allow") {
          if (Array.isArray(Resource)) {
            expect(Resource).not.toContain("*");
          } else {
            expect(Resource).not.toEqual("*");
          }
        }
      }
    }
  } while (policyResourcesCapture.next());
});
