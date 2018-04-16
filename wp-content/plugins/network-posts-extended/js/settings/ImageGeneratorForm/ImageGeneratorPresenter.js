/**
 * Created by Andrew on 19.09.2016.
 */
    var GET_GENERATOR_FORM = 'admin-ajax.php?action=get_image_generator_form';
    var POST_URL = 'admin-post.php?action=generate_images';

    function ImageGeneratorPresenter(view) {
        this.formView = view;
        var cached_sizes = null;

        this.getSizes = function(){
            return cached_sizes;
        };
        this.setSizes = function(list){
            cached_sizes = list;
            if(list && view.isInitialized() && !view.isOptionsSet)
                this.formView.setSelectOptions(list);
        };
    }

    ImageGeneratorPresenter.prototype.loadView = function () {
        var view = this.formView;
        var presenter = this;
        Ajax.getHtml(GET_GENERATOR_FORM, function (html) {
            view.setHtml(html);
            if(!view.isOptionsSet && presenter.getSizes())
                view.setSelectOptions(presenter.getSizes());
        });
    };

    ImageGeneratorPresenter.prototype.remove = function(index){
        this.getSizes().splice(index - 1, 1);
        this.formView.removeOption(index);
    };

    ImageGeneratorPresenter.prototype.regenerate = function(elements){
        var presenter = this;
        if(elements) {
            var params = Ajax.prepareString(elements, true);
            var request = Ajax.createAjaxRequest('POST', POST_URL + '&' + 'r=' + Math.random(), true, function () {
                if (this.readyState == 4) {
                    presenter.formView.hideProgressBar();
                }
            });
            request.onprogress = function () {
                if (this.responseText.length > 1) {
                    var lastObjStart = this.responseText.lastIndexOf('{');
                    try {
                        var responseObj = JSON.parse(this.responseText.substring(lastObjStart));
                        presenter.formView.setProgress(responseObj);
                    }
                    catch(error){
                        console.log(error);
                    }
                }
            };
            request.send(params);
            this.formView.showProgressBar();
        }
    };