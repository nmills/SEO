/**
 * Created by Andrew on 12.09.2016.
 */
    var ERROR_CLASS = 'error';

    function FormView(){
        var presenter = new FormPresenter(this);
        var viewHolder = new FormViewHolder();
        var OnEntryCreatedListener = null;
        var OnEntryModified = null;

        this.getPresenter = function(){
            return presenter;
        };

        this.getViewHolder = function(){
            return viewHolder;
        };

        this.isShown = false;

        FormView.prototype.setOnEntryCreatedListener = function(callback){
            OnEntryCreatedListener = callback;
        };

        FormView.prototype.getOnEntryCreatedListener = function(){
            return OnEntryCreatedListener;
        };

        FormView.prototype.setOnEntryUpdatedListener = function(callback){
            OnEntryModified = callback;
        };

        FormView.prototype.getOnEntryUpdatedListener = function(){
            return OnEntryModified;
        }

    }

    FormView.prototype.init = function(){
        this.getPresenter().loadView();
    };

    FormView.prototype.setHtml = function(html){
        var parent = document.getElementById('forms');
        if(parent){
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            parent.appendChild(wrapper);
            this.attachEvents();
        }
    };

    FormView.prototype.show = function(title, showInputs){
        this.isShown = true;
        if(showInputs)
            this.getViewHolder().getForm().children[2].style.display = 'block';
        this.getViewHolder().getForm().classList.remove('invisible')
        if(title)
            this.getViewHolder().getForm().children[0].innerText = title;
    };

    FormView.prototype.showForId = function(id){
        if(id) {
            this.getPresenter().loadModel(id);
        }
    };

    FormView.prototype.showModel = function(model){
        if (model) {
            var elements = this.getViewHolder().getForm().elements;
            elements['size_id'].value = model.id;
            for (var key in model.data) {
                if (elements[key].length == undefined) {
                    if (elements[key].type == 'text' || elements[key].type == 'number')
                        elements[key].value = model.data[key];
                    else if (elements[key].type == 'checkbox') {
                        elements[key].checked = model.data[key];
                        if (model.data[key]) {
                            this.showCropDirections();
                        }
                    }
                }
                else {
                    if(elements[key].forEach == 'Function') {
                        elements[key].forEach(function (item) {
                            if (item.type == 'radio' && item.value == model.data[key])
                                item.checked = true;
                        });
                    }
                    else{
                        for(var i = 0; i < elements[key].length; i++){
                            var item = elements[key][i];
                            if (item.type == 'radio' && item.value == model.data[key])
                                item.checked = true;
                        }
                    }
                }
            }
        }
    };

    FormView.prototype.hide = function(clear){
        if(clear){
            this.clearInputs()
        }
        this.getViewHolder().getForm().classList.add('invisible');
        this.getViewHolder().getForm().children[2].children['crop_directions'].style.display = 'none';
        this.isShown = false;
    };

    FormView.prototype.showCropDirections = function(){
        var cropDirections = this.getViewHolder().getForm().children[2].children['crop_directions'];
        if(cropDirections){
            cropDirections.style.display = 'block';
        }
    };

    FormView.prototype.showModelLoading = function(showLoading){
        var form = this.getViewHolder().getForm();
        if(showLoading){
            form.children[2].style.display = 'none';
            form.children[1].style.display = 'block';
        }
        else{
            form.children[1].style.display = 'none';
            form.children[2].style.display = 'block';
        }
    };

    FormView.prototype.hideCropDirections = function(){
        var cropDirections = this.getViewHolder().getForm().children[2].children['crop_directions'];
        if(cropDirections){
            cropDirections.style.display = 'none';
        }
    };

    FormView.prototype.addError = function(element, error){
        if (!element.classList.contains(ERROR_CLASS)) {
            element.classList.add(ERROR_CLASS);
        }
        var errorMessage = element.parentNode.children[2];
        errorMessage.innerText = error;
        errorMessage.style.visibility = 'visible';
    };

    FormView.prototype.resetError = function(element){
        if (element.classList.contains(ERROR_CLASS)) {
            element.classList.remove(ERROR_CLASS);
        }
        var errorMessage = element.parentNode.children[2];
        errorMessage.innerText = '';
        errorMessage.style.visibility = 'invisible';
    };

    FormView.prototype.showSaving = function(show){
        var submitButton = this.getViewHolder().getSubmitButton();
        if(show){
            submitButton.innerHTML += '<img src="' + data.loading_gif + '" class="button-loading-gif" alt="loading"/>';
        }
        else submitButton.removeChild(submitButton.children[0]);
    };

    FormView.prototype.clearInputs = function(){
        var inputs = this.getViewHolder().getInputs();
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            if (input.type == 'checkbox')
                input.checked = false;
            else if (input.type != 'radio') input.value = '';
        }
    };

    FormView.prototype.attachEvents = function(){
        var viewHolder = this.getViewHolder();
        var view = this;
        viewHolder.getShowFormButton().classList.remove('btn-disabled');

        viewHolder.getShowFormButton().addEventListener('click', function(e){
            if(!view.isShown)
                view.show(data.create_item_title, true);
        });

        viewHolder.getCancelButton().addEventListener('click', function(e){
            view.hide(true);
        });

        viewHolder.getForm().crop.addEventListener('click', function(e){
            if(this.checked){
                view.showCropDirections();
            }
            else view.hideCropDirections();
        });

        viewHolder.getForm().addEventListener('submit', function(e){
            e.preventDefault();
            if(view.getPresenter().validateForm()){
                if(!view.getViewHolder().getForm().id.value)
                    view.getPresenter().createEntry(document.querySelectorAll('form#size_parameters input'), view.getOnEntryCreatedListener());
                else view.getPresenter().createEntry(document.querySelectorAll('form#size_parameters input'), view.getOnEntryUpdatedListener());
            }
            return false;
        });

        viewHolder.getForm().name.addEventListener('keydown', function (e) {
            var alias = viewHolder.getForm().alias;
            if (e.key.length == 1 && view.getPresenter().isValidKey(e.key)) {
                if (e.key != ' ')
                    alias.value += e.key.toLowerCase();
                else if (!(this.value.length == 0 || alias.value.length == 0)) {
                    alias.value += '-';
                }
                else return;
            }
            else if (e.key.toLowerCase() == 'backspace' && alias.value.length > 0) {
                alias.value = alias.value.substring(0, alias.value.length - 1);
            }
            else return;
        });
    }


    function FormViewHolder(){
        this.getShowFormButton = function(){
            return document.getElementById('show_form');
        };
        this.getSubmitButton = function(){
            return document.getElementById('add_size');
        };
        this.getCancelButton = function(){
            return document.getElementById('close_add_size_form');
        };

        this.getForm = function(){
            return document.getElementById('size_parameters');
        };
        this.getInputs = function(){
            return document.querySelectorAll('form#size_parameters input');
        };
        this.getFormGroup = function(){
            return document.getElementById('model_form');
        };
        this.getTitle = function(){
            return document.getElementById('form_title');
        }
    }