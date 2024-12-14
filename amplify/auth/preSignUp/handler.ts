import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: "us-east-2" });

interface CognitoEvent {
    request: {
        userAttributes: {
            email?: string;
            username?: string;
            [key: string]: string | undefined; // For additional user attributes
        };
    };
}

export const handler = async (event: CognitoEvent) => {
    const confirmUserAPIEndpoint = `https://92tymsq010.execute-api.us-east-2.amazonaws.com/dev/?username=${event.request.userAttributes.email}`
    const topicArn = "arn:aws:sns:us-east-2:575877332477:preSignUp";
    const adminMessage = 
    `A new account has been created! ${event.request.userAttributes.email}
    
    Link to CONFIRM: ${confirmUserAPIEndpoint}
    `;


    try {
        // Publish a message to the SNS topic
        const publishCommand = new PublishCommand({
            TopicArn: topicArn,
            Message: adminMessage,
            Subject: "New User Signup Request",
        });
        const response = await snsClient.send(publishCommand);

        console.log("Message sent to admin:", response);
        return event
    } catch (error) {
        console.error("Error sending message to admin:", error);
        throw error
    }
};
