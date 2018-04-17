function() {
  return function(model) {
    // Add the PII patterns into this array as objects
    var piiRegex = [{
      name: 'EMAIL',
      regex: /.{4}@.{4}/g
    },{
      name: 'PHONE',
      regex: /\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})/gi
    }];
    
    var globalSendTaskName = '_' + model.get('trackingId') + '_sendHitTask';
    
    // Fetch reference to the original sendHitTask
    var originalSendTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
  
    var i, hitPayload, parts, val;
    
    // Overwrite sendHitTask with PII purger
    model.set('sendHitTask', function(sendModel) {
      hitPayload = sendModel.get('hitPayload').split('&');
      for (i = 0; i < hitPayload.length; i++) {
        parts = hitPayload[i].split('=');
        // Double-decode, to account for web server encode + analytics.js encode
        val = decodeURIComponent(decodeURIComponent(parts[1]));
        piiRegex.forEach(function(pii) {
          val = val.replace(pii.regex, '[REDACTED ' + pii.name + ']');
        });
        parts[1] = encodeURIComponent(val);
        hitPayload[i] = parts.join('=');
      }
      sendModel.set('hitPayload', hitPayload.join('&'), true);
      originalSendTask(sendModel);
    });
  };
}


//-----------------------------------------------------------------------------



function() {
  return function(model) {
  
    // Specify the PII regular expressions
    var piiRegEx = [{
      name: 'EMAIL',
      regex: /.{4}@.{4}/g
    }];

    var globalSendTaskName = '_' + model.get('trackingId') + '_originalSendTask';
    
    var originalSendTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');
    var customDimensionIndex = 1;
    
    var i, hitpayload, parts, val, oldTrackingId;
    
    model.set('sendHitTask', function(sendModel) {
    
      // Clear the payload of PII:
      hitPayload = sendModel.get('hitPayload').split('&');
      
      for (i = 0; i < hitPayload.length; i++) {
        parts = hitPayload[i].split('=');
        
        // Double-decode, to account for web server encode + analytics.js encode
        val = decodeURIComponent(decodeURIComponent(parts[1]));
        
        piiRegex.forEach(function(pii) {
          val = val.replace(pii.regex, '[REDACTED ' + pii.name + ']');
        });
        
        parts[1] = encodeURIComponent(val);
        hitPayload[i] = parts.join('=');
      }
      
      sendModel.set('hitPayload', hitPayload.join('&'), true);
      originalSendTask(sendModel);
      
      // Rewrite the tracking ID
      hitPayload = sendModel.get('hitPayload');
      // oldTrackingId = new RegExp(sendModel.get('trackingId'), 'gi');
      sendModel.set('hitPayload', hitPayload.join('dimension' + customDimensionIndex, model.get('clientId')), true);
      originalSendTask(sendModel);
    });
  }
}