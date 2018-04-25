function() {
  return function(model) {
  
    // Specify the PII regular expressions
    var piiRegex = [{
      name: 'EMAIL',
      regex: /.{4}@.{4}/g
    }];

    var globalSendTaskName = '_' + model.get('trackingId') + '_originalSendTask';
    
    var originalSendTask = window[globalSendTaskName] = window[globalSendTaskName] || model.get('sendHitTask');

    var customDimensionIndex = 1;

    model.set('dimension' + customDimensionIndex, model.get('clientId'));

    var i, hitPayload, parts, val;
    
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
    });
  }
}