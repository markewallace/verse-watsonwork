(function() {

  var userIds = [ 'internal-e1970f87-3114-498e-9300-cb311b7871be' ]; /*, 
                  '91ae7240-8f0a-1028-83e9-db07163b51b2', 
                  '720b5624-b7dc-4ee1-aefe-bdc50611a2a8', 
                  '8a90987e-1cc7-484f-a749-4af0ad82a21c', 
                  'e35fe540-8468-1031-8ab5-cdbbe14045ca' ];*/
  var actorName = 'Chris Crummey';
  var actorUrl = 'https://avatars1.githubusercontent.com/u/22985179';
  var actorAvatar = 'https://github.com/watsonwork-helloworld';
  
  var subject;
  var bodyHtml;
  var bodyText;
  var emails;
  
  if (window.opener) {
    if (window.opener.location.origin === window.location.origin) {
      var code = getParameterByName('code');
      console.log('code: ' + code);
      var access_code_message = {
        access_code: code
      };
      window.opener.postMessage(access_code_message, window.location.origin);
      window.close();
    }
  }
  
  window.addEventListener('message', function(event) {
    console.log('message: %O', event);
    if(event.data) {
      if (event.data.verseApiType === 'com.ibm.verse.ping.application.loaded') {
        var loaded_message = {
          verseApiType: 'com.ibm.verse.application.loaded'
        };
        event.source.postMessage(loaded_message, event.origin);
      }
      if(event.data.verseApiData) {
        console.log('Verse API data: %O', event.data.verseApiData);
        subject = event.data.verseApiData.context.subject || 'Posted from IBM Verse';
        bodyHtml = event.data.verseApiData.context.body || '';
        bodyText = bodyHtml.replace(/<br\s*[\/]?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/&gt;/g, ' ').replace(/(<([^>]+)>)/ig, '');
        actorName = event.data.verseApiData.context.sender.displayName || 'Chris Crummey';
        emails = getEmails(event.data.verseApiData.context);
        console.log('Emails: %O', emails);
        
        $("#create-workspace").hide();
        $("#access").hide();
        $("#grant").show();
        
        var refresh_token = localStorage.getItem('v_ww_r_t');
        if (!refresh_token) {
          var redirectUri = window.location.origin + window.location.pathname;
          window.workspace.authorize(redirectUri);
        }
      }
      if (event.data.access_code) {
        handleAccessCode(event.data.access_code);
      }
    }
    else {
      console.warn('No data retrieved from Verse');
    }
  }, false);
  
  
  function handleAccessCode(code) {
    $("#access").hide();
    $("#grant").hide();
    $("#create-workspace").show();
    
    window.workspace.code = code;
    
    document.getElementById('actor-name').innerText = actorName;
    document.getElementById('title').innerText = subject;
    document.getElementById('text').innerText = bodyText;
    
    $('#create-space').on('click', function() {
      var val = $('#space-to-create').val();
      window.workspace.createSpace(val, userIds, function(response) {
      if (response.data && response.data.createSpace && response.data.createSpace.space) {
        var spaceId = response.data.createSpace.space.id;
        window.workspace.postToSpace(spaceId, subject, bodyText, actorName, actorAvatar, actorUrl, handlePostedToSpace);
      } else {
        $("#progress").hide();
        $("#fail").show();
        console.error('Error creating space: %O', response);
      }
      });
      $("#create-workspace").hide();
      $("#progress").show();
    });
    
    $('#space-to-create').on('input', function() { 
      var val = $(this).val();
      handleSpace(val);
    });
  }
  
  function handlePostedToSpace(status) {
    console.log('postToSpace returned: %O', status);
    $("#progress").hide();
    if (status === 201) {
      $("#success").show();       
    } else {
      $("#fail").show();
      console.error('Error posting to space: %O', status);
    }
  }
  
  function handleSpace(title) {
    if(title) {
      $('#create-space').prop('disabled', false);
    } else {
      $('#create-space').prop('disabled', true);
    }
  }
  
  function getParameterByName(name, url) {
    if (!url) {
      url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  function getEmails(context) {
   var emails = [];
   emails.push(context.sender.emailAddress);
   context.recipientTo.forEach(function(recipient) {
     emails.push(recipient.emailAddress);
   });
   context.recipientCC.forEach(function(recipient) {
     emails.push(recipient.emailAddress);
   });
   return emails;
  }

})();

