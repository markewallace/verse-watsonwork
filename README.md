# verse-watsonwork
A Node.js sample app that demonstrate how to post a mail from IBM Verse to Watson Workspace.

## Running the Sample

To try the sample do the following:

### Registering the Application

In your Web browser, go to [Watson Work Services - Apps]
(https://workspace.ibm.com/developer/apps), add a new app and add the url of the server you will be running this application from https://www.example.com/callback. Make sure the /callback is included in this url. Next write down its app id and app secret.

### Building the Sample

Install Node.js 6+.
Install the dependancies and run the sample using these commands:
```
npm install
npm start
```

### Configuring the Sample

See '/config/applications.json' for the application definition to be registered with Verse
