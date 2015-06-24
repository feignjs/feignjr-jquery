
var Args = require('args-js');
var jq = require('jquery');
var _ = require('lodash')
 
if (typeof window === 'undefined') { // Running in NodeJS
  var domino=require('domino');
  jq=jq(domino.createWindow());
  var XMLHttpRequest=require('xmlhttprequest').XMLHttpRequest;
  jq.support.cors=true; // cross domain
  jq.ajaxSettings.xhr=function(){return new XMLHttpRequest();};
};


function FeignJqueryClient(){
  var args  = Args([
      { defaults: Args.OBJECT | Args. Optional, _default: {}},
      { jQuery: Args.ANY | Args.Optional, _default: jq}
    ], arguments);

  this.jQuery = args.jQuery;
  this.defaults = args.defaults;
}

FeignJqueryClient.prototype.request =  function(request){
  var options = this._createJQueryJsOptions(request.baseUrl, request.options, request.parameters);
  var _this = this;
  var promise = new Promise(function(resolve, reject){
    _this.jQuery.ajax(options).then(function(data, status, jqXHR){
        return resolve({raw: jqXHR, body: data});
    }, function( jqXHR, textStatus, errorThrown ){
      return reject({status: jqXHR.status, message: jqXHR.responseText});
    });
  });
  return promise;
};

FeignJqueryClient.prototype._createJQueryJsOptions = function(baseUrl, requestOptions, parameters){
  var options  = Args([
      { method: Args.STRING | Args.Optional, _default: 'GET' },
      { uri: Args.STRING | Args.Required}
    ], [requestOptions]);

    
    var jqSettings = _.defaults({
      url: baseUrl + options.uri,
      method: options.method
    }, this.defaults);
    if (parameters != null){
      jqSettings.data = parameters;
    }
  
  return jqSettings;
};


module.exports = FeignJqueryClient;