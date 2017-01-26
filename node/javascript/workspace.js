(function() {

  var appId = 'f7677c86-cf75-4947-805e-c8b2e05e4d93';
  var appSecret = '2guupyy0v196khsre9w4ov6ramcwhavt';
  
  var graphqlUrl = 'https://workspace.ibm.com/graphql';
  var tokenUrl = 'https://api.watsonwork.ibm.com/oauth/token';
  var authorizeUrl = 'https://workspace.ibm.com/oauth/authorize';

  var access_token;
  var refresh_token;
  var code;

  if (window.workspace) {
    return window.workspace;
  }
  var workspace = {

    getToken: function() {
      var code = arguments.length > 2 ? arguments[0] : null;
      var redirectUri = arguments.length > 2 ? arguments[1] : null;
      var callback = arguments.length > 2 ? arguments[2] : arguments[0];
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', tokenUrl);
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(appId + ':' + appSecret));
      xhr.onload = function() {
        console.log('Get token response: %O', xhr.response);
        if (xhr.status == 200) {
          refresh_token = xhr.response.refresh_token || null;
          if (refresh_token) {
            localStorage.setItem('v_ww_r_t', refresh_token);
          }
          
          access_token = xhr.response.access_token;
          callback(access_token);
        }
      }
      var params = 'grant_type=client_credentials';
      if (code) {
        params = 'grant_type=authorization_code&code=' + code + '&redirect_uri=' + encodeURIComponent(redirectUri);
      }
      console.log(params);
      xhr.send(params);
    },
    
    authorize: function(redirectUri) {
      var state = 'Uv4Ypd9q2hXe5FPk2RCMaQ=='; // TODO generate this
      var query = '?client_id=' + appId + '&response_type=code&redirect_uri=' + encodeURIComponent(redirectUri) + '&state=' + encodeURIComponent(state);
      var href = authorizeUrl + query;
      window.open(href, '_blank', 'location=no,width=500,height=500');
    },

    postToSpace: function(spaceId, subject, bodyText, actorName, actorAvatar, actorUrl, callback) {
      var postUrl = 'https://api.watsonwork.ibm.com/v1/spaces/' + spaceId + '/messages';

      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', postUrl);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.onload = function() {
        console.log('postToSpace returned: %O', xhr.status);
        callback(xhr.status);
      }
      xhr.send(JSON.stringify({
        type: 'appMessage',
        version: 1.0,
        annotations: [{
          type: 'generic',
          version: 1.0,

          color: '#6CB7FB',
          title: subject,
          text: bodyText,

          actor: {
            name: actorName,
            avatar: actorAvatar,
            url: actorUrl
          }
        }]
      }));
    },
    
    createSpace: function(title, userIds, code, redirectUri, callback) {
      if (!access_token) {
        var self = this;
        this.getToken(code, redirectUri, function() {
          self.createSpace(title, userIds, code, redirectUri, callback);
        });
        return;
      }
      var members = "";
      userIds.forEach(function(userId) {
        if (members.length > 0) members += ",";
        members += "\"" + userId + "\"";
      });
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', graphqlUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        console.log('createSpace returned: %O', xhr.response);
        callback(xhr.response);
      }
      var query = "mutation createSpace { createSpace(input: { title: \"" + title + "\",  members: [" + members + "] }) { space { id } } }";
      xhr.send(JSON.stringify({
        operationName: 'createSpace',
        query: query,
        variables: null
      }));
    },

    getSpaces: function(callback) {
      if (!access_token) {
        var self = this;
        this.getToken(function() {
          self.getSpaces(callback);
        });
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', graphqlUrl);
      xhr.setRequestHeader('jwt', access_token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        console.log('getSpaces returned: %O', xhr.response);
        var spaces = xhr.response.data.spaces.items;
        callback(spaces);
      }
      var query = `query getSpaces {
        spaces(first: 50) {
          items {
            title
          id
          description
        }
        }
      }`;
      xhr.send(JSON.stringify({
        query: query,
        variables: null
      }));
    },
    
    getUserIds: function(emails, callback) {
      
    },
    
    getUserId: function(email, callback) {
      if (!access_token) {
        var self = this;
        this.getToken(function() {
          self.getUserId(email, callback);
        });
        return;
      }
      var xhr = new XMLHttpRequest();
      xhr.responseType = 'json';
      xhr.open('POST', graphqlUrl);
      xhr.setRequestHeader('jwt', access_token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.onload = function() {
        console.log('getProfile returned: %O', xhr.response);
        var userId = xhr.response.data.person.id;
        callback(userId);
      }
      var query = `query getProfile {
        person(email: \"' + email + '\") {
          id
        }
      }`;
      xhr.send(JSON.stringify({
        query: query,
        variables: null
      }));
    }
  };

  window.workspace = workspace;
  console.log("workspace ready...");
  return workspace;

})();