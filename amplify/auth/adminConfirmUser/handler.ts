import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
const snsClient = new SNSClient({ region: "us-east-2" });
const IAMclient = new CognitoIdentityProviderClient({ region: "us-east-2" });

export const handler = async (event:any) => {
    const topicArn = "arn:aws:sns:us-east-2:575877332477:preSignUp"; 
    
    const command = new AdminConfirmSignUpCommand({
        Username: event?.request?.username,
        UserPoolId: 'us-east-2_3vu2A9ENZ'
    })
    try {
        const IAMresponse = await IAMclient.send(command)
        if(IAMresponse) {
            const adminMessage = "User account created successfully!"
            const publishCommand = new PublishCommand({
                TopicArn: topicArn,
                Message: adminMessage,
                Subject: "New User Created!",
            });
            const SNSresponse = await snsClient.send(publishCommand);
            console.log("Confirmed User", IAMresponse, SNSresponse)
        }
        
        return event
    } catch (error) {
        const adminMessage = `User Account Creation FAILED; ${error}`
        const publishCommand = new PublishCommand({
            TopicArn: topicArn,
            Message: adminMessage,
            Subject: "FAILED to create new user.",
        });
        const SNSresponse = await snsClient.send(publishCommand);
        console.error("Error confirming user:", error, SNSresponse);
        throw error
    }
};
