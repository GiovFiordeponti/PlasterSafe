class Cognito{

    /**
     * 
     * @param {*} authCallback 
     */
    constructor(authCallback) {
        AWS.config.region = 'us-east-1'; // like: us-east-1
        this.authData = {
            ClientId: COGNITO_CLIENT_ID, // Your client id here
            AppWebDomain: COGNITO_APP_WEB_DOMAIN,
            TokenScopesArray: COGNITO_TOKEN_SCOPE_ARRAY, // e.g.['phone', 'email', 'profile','openid', 'aws.cognito.signin.user.admin'],
            RedirectUriSignIn: REDIRECT_URI_SIGN_IN,
            RedirectUriSignOut: REDIRECT_URI_SIGN_OUT,
            UserPoolId: COGNITO_USER_POOL_ID, // Your user pool id here
        };
        //var login = {};
        this.auth = new AmazonCognitoIdentity.CognitoAuth(this.authData);
        this.auth.userhandler = {
            onSuccess: function (result) {
                authCallback(result);
            },
            onFailure: function (err) {
                console.error("received error %o", err);
            }
        };

        console.log("auth object created: %o", this.auth);
    }

    /**
     * 
     */
    getAuth(){
        return this.auth;
    }

    /**
     * 
     */
    getAuthData(){
        return this.authData;
    }

    /**
     * 
     * @param {*} curUrl 
     */
    parseCognitoWebResponse(curUrl){
        this.auth.parseCognitoWebResponse(curUrl);
    }
    
}