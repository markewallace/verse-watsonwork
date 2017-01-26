(function() {

  var availableSpaces;
  var spaceId;

  var actorName = 'Chris Crummey';
  var actorUrl = 'https://avatars1.githubusercontent.com/u/22985179';
  var actorAvatar = 'https://github.com/watsonwork-helloworld';
  
  var subject;
  var bodyHtml;
  var bodyText;
  
  window.addEventListener('message', function(event) {
    if(event.data) {
      if(event.data.verseApiData) {
        subject = event.data.verseApiData.context.subject || 'Posted from IBM Verse';
        bodyHtml = event.data.verseApiData.context.body || '';
        bodyText = bodyHtml.replace(/<br\s*[\/]?>/gi, '\n').replace(/&nbsp;/g, ' ').replace(/&gt;/g, ' ').replace(/(<([^>]+)>)/ig, '');
        actorName = event.data.verseApiData.context.sender.displayName || 'Chris Crummey';
        
        window.workspace.getSpaces(function(spaces) {
          handleSpaces(spaces);
        });
        
        document.getElementById('actor-name').innerText = actorName;
        document.getElementById('title').innerText = subject;
        document.getElementById('text').innerText = bodyText;
        
        $('#share-to-space').on('click', function() {
          window.workspace.postToSpace(spaceId, subject, bodyText, actorName, actorAvatar, actorUrl, handlePostedToSpace);
          $("#send-workspace").hide();
          $("#progress").show();
        });
        
        $('#space').on('input', function() { 
          var val = $(this).val();
          handleSpace(val);
        });
      }
    } else {
      console.warn('No data retrieved from Verse');
    }
  }, false);
  
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
  
  function handleSpaces(spaces) {
    availableSpaces = spaces;
    var spaceTitles = [];
    for (var i = 0; i < spaces.length; i++) {
      spaceTitles.push(spaces[i].title);
    }
    $("#space").autocomplete({
      source: spaceTitles,
      select: function(event, ui) {
        var val = ui.item.label;
        handleSpace(val);
      }
    });
  }
  
  function handleSpace(title) {
    var matchingSpaces = availableSpaces.filter(function(space) {
      return space.title === title;
    });
    if(matchingSpaces.length > 0) {
      spaceId = matchingSpaces[0].id;
      $('#share-to-space').prop('disabled', false);
    } else {
      $('#share-to-space').prop('disabled', true);
    }
  }

})();
