const { CognitoJwtVerifier } = require("aws-jwt-verify")

const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEBCLIENT_ID = process.env.COGNITO_WEBCLIENT_ID

const jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: COGNITO_USERPOOL_ID,// "ap-south-1_8arhLlCkp",
    tokenUse: "id",
    clientId: COGNITO_WEBCLIENT_ID// "1sprv0inflcc2fa98323dnqng0"
})

const generatePolicy = (principalId, effect, resource) => {
    var authResponse = {};
    authResponse.principalId = principalId

    if(effect && resource) {
        let policyDocument = {
            Version: "2012-10-17",
            Statement: {
                Effect: effect,
                Resource: resource,
                Action: "execute-api:Invoke"
            }
        }
        authResponse.policyDocument = policyDocument
    }
    authResponse.context = {
        foo : "bar"
    }
    console.log(JSON.stringify(authResponse));
    return authResponse
}

exports.handler = async (event, context, callback) => {
    var token = event.authorizationToken;   // allow or deny // authorizationToken
    console.log(token)

    //validate the jwt token
    try{
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload))
        callback(null, generatePolicy("user", "Allow", event.methodArn));
    }
    catch(err) {
        console.log(err)
        callback(null, generatePolicy("user","Deny", event.methodArn));
    }



    // switch(token) {
    //     case "allow":
    //         callback(null, generatePolicy("user", "Allow", event.methodArn));
    //         break;
    //     case "deny":
    //         callback(null, generatePolicy("user","Deny", event.methodArn));
    //         break;
    //     default:
    //         callback("Error: Invalid token");
    //         break;
    // }
};