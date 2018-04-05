/**
 * Created by Andrew on 12.09.2016.
 */
    var ADD_SIZE_URL = 'admin-post.php?action=netsposts_add_size';
    var REMOVE_SIZE_URL = 'admin-post.php?action=netsposts_remove_size';
    var GET_SIZES_URL = 'admin-ajax.php?action=netsposts_get_sizes';
    var GET_SIZE_BY_ID_URL = 'admin-ajax.php?action=netsposts_get_size';

    var Ajax = {
        prepareString: function (inputs, isPost) {
            var params = '';
            for (var index = 0; index < inputs.length; index++) {
                var input = inputs[index];
                if (input.type == 'text' || input.type == 'number' || input.type == 'hidden') {
                    if (input.value && input.value.length > 0)
                        params += '&' + input.name + '=' + input.value;
                }
                else if (input.type == 'checkbox')
                    params += '&' + input.name + '=' + input.checked;
                else if (input.type == 'radio' && input.checked)
                    params += '&' + input.name + '=' + input.value;
                else if(input.localName == 'select'){
                    params += '&' + input.name + '=' + input.selectedIndex;
                }
            }
            if(isPost){
                params = params.substring(1);
            }
            return params;
        },
        createAjaxRequest: function (method, url, async, callback){
            var request = new XMLHttpRequest();
            if(async)
                request.onreadystatechange = callback;
            request.open(method, url, async);
            if (method.toLowerCase() == 'post')
                request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            return request;
        },
        createEntry: function (inputs, callback, errorCallback) {
            var request = Ajax.createAjaxRequest('POST', ADD_SIZE_URL, true, function(e){
                if(this.readyState == 4) {
                    if(this.status == 200) {
                        if (this.responseText.length > 1) {
                            var model = Ajax.makeModel(this.responseText);
                            if (model) {
                                callback(model);
                            }
                        }
                    }
                    else if(errorCallback){
                        errorCallback(this.responseText);
                    }
                }
            });
            request.send(Ajax.prepareString(inputs));
        },
        loadEntries: function (callback, errorCallback) {
            var request = Ajax.createAjaxRequest('GET', GET_SIZES_URL, true, function(){
                if(this.readyState == 4)
                    if(this.status == 200 && this.responseText.length > 1){
                        var models = Ajax.makeModel(this.responseText);
                        if(models){
                            callback(models);
                        }
                    }
                    else if(errorCallback){
                        errorCallback(this.status);
                    }
            });
            request.send();
        },
        removeEntry: function (id, callback) {
            var request = Ajax.createAjaxRequest('POST', REMOVE_SIZE_URL, true, callback);
            request.send('id=' + id);
        },
        getEntry: function(id, callback){
            var request = Ajax.createAjaxRequest('GET', GET_SIZE_BY_ID_URL + '&id=' + id, true, function(){
                if(this.readyState == 4 && this.status == 200)
                    if(this.responseText.length > 1){
                        var model = Ajax.makeModel(this.responseText);
                        if(model){
                            callback(model);
                        }
                    }
            });
            request.send();
        },
        makeModel:function(responseText){
            var result = null;
            var lastSymbol = responseText.substring(responseText.length - 1);
            if(lastSymbol == '0') {
                responseText = responseText.substring(0, responseText.length - 1);
            }
            try{
                result = JSON.parse(responseText);
            }
            catch(error){
                console.log(error);
            }
            return result;
        },
        getHtml:function(url, callback){
            var request = Ajax.createAjaxRequest('GET', url, true, function(){
                if(this.readyState == 4 && this.status == 200)
                    if(this.responseText.length > 1){
                        var responseText = this.responseText;
                        var lastSymbol = responseText.substring(responseText.length - 1);
                        if(lastSymbol == '0') {
                            responseText = responseText.substring(0, responseText.length - 1);
                        }
                        callback(responseText);
                    }
            });
            request.send();
        }
    };