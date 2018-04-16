/**
 * Created by Andrew on 12.09.2016.
 */
    var EMPTY_FIELD_MESSAGE = 'Empty field';
    var INVALID_NUMBER_MESSAGE = 'A number must be positive';
    var GET_INPUT_FORM = 'admin-ajax.php?action=get_add_size_form';

    function FormPresenter(view){
        this.formView = view;
    }

    FormPresenter.prototype.loadView = function(){
        var view = this.formView;
        Ajax.getHtml(GET_INPUT_FORM, function(html){
            view.setHtml(html);
        });
    };

    FormPresenter.prototype.validateForm = function() {
        var elements = this.formView.getViewHolder().getForm().elements;
        var valid = true;
        if (!elements.name.value) {
            this.formView.addError(elements.name, EMPTY_FIELD_MESSAGE);
            valid = false;
        }
        else this.formView.resetError(elements.name);
        if (!elements.width.value) {
            this.formView.addError(elements.width, EMPTY_FIELD_MESSAGE);
            valid = false;
        }
        else {
            var width = parseInt(elements.width.value);
            if (width <= 0) {
                this.formView.addError(elements.width, INVALID_NUMBER_MESSAGE);
                valid = false;
            }
            else this.formView.resetError(elements.width);
        }
        return valid;
    };

    FormPresenter.prototype.loadModel = function(id){
        var view = this.formView;
        view.show(data.modify_item_title, false);
        view.showModelLoading(true);
        Ajax.getEntry(id, function(model){
            if(model) {
                view.showModel(model);
            }
            view.showModelLoading(false);
        });
    };

    FormPresenter.prototype.createEntry = function(inputs, callback){
        var presenter = this;
        this.formView.showSaving(true);
        Ajax.createEntry(inputs, function(entry){
            presenter.formView.showSaving(false);
            presenter.formView.hide(true);
            callback(entry);
        });
    };

    FormPresenter.prototype.isValidKey = function(key){
        return key == ' ' || key == '-' || /[0-9a-zA-Z]/.test(key);
    };
