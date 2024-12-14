import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { CognitoIdentityProviderClient, AdminConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
const snsClient = new SNSClient({ region: "us-east-2" });
const IAMclient = new CognitoIdentityProviderClient({ region: "us-east-2" });

export const handler = async (event:any) => {
    const command = new AdminConfirmSignUpCommand({
        Username: event?.request?.email,
        UserPoolId: 'us-east-2_3vu2A9ENZ'
    })
    try {
        const response = await IAMclient.send(command)
        console.log("Confirmed User", response)
        return event
    } catch (error) {
        console.error("Error confirming user:", error);
        throw error
    }
};
