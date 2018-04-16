/**
 * Created by Andrew on 19.09.2016.
 */
    function ImageGeneratorView(){
        var presenter = new ImageGeneratorPresenter(this);
        var viewHolder = new ViewHolder();
        var visible = false;
        var initialized = false;
        this.isOptionsSet = false;

        this.setInitialized = function(){
            initialized = true;
        };

        this.isInitialized = function(){
            return initialized;
        };

        this.getPresenter = function(){
            return presenter;
        };

        this.setPresenter = function(newPresenter){
            presenter = newPresenter;
        };

        this.getViewHolder = function(){
            return viewHolder;
        };

        this.isFormVisible = function(){
            return visible;
        };

        this.setVisible = function(value){
            visible = value;
        };
    }

    ImageGeneratorView.prototype.init = function(){
        this.getPresenter().loadView();
    };

    ImageGeneratorView.prototype.setHtml = function(html){
        if(html){
            var wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            this.getViewHolder().getParent().appendChild(wrapper);
            this.attachEvents();
            this.setInitialized();
        }
    };

    ImageGeneratorView.prototype.setSelectOptions = function(list){
        var select = this.getViewHolder().getForm().sizes;
        for(var i = 0; i < list.length; i++){
            select.appendChild(this.createOption(list[i]));
        }
        this.isOptionsSet = true;
    };

    ImageGeneratorView.prototype.addOption = function(entry){
        var select = this.getViewHolder().getForm().sizes;
        select.appendChild(this.createOption(entry));
    };

    ImageGeneratorView.prototype.createOption = function(entry){
        var option = document.createElement('option');
        option.innerText = entry.data.name + " (" + entry.data.alias + ")";
        option.value = entry.id;
        return option;
    };

    ImageGeneratorView.prototype.removeOption = function(index){
        this.getViewHolder().getForm().sizes.remove(index);
    };

    ImageGeneratorView.prototype.setActiveShowFormButton = function(active){
        if(active)
            this.getViewHolder().getShowFormButton().classList.add('active');
        else this.getViewHolder().getShowFormButton().classList.remove('active');
    };

    ImageGeneratorView.prototype.disableShowFormButton = function(){
        this.getViewHolder().getShowFormButton().classList.add('btn-disabled');
        this.getViewHolder().getShowFormButton().disabled = true;
    };

    ImageGeneratorView.prototype.show = function(){
        this.getViewHolder().getFormWrapper().classList.remove('invisible');
        this.setVisible(true);
    };

    ImageGeneratorView.prototype.hide = function(){
        this.getViewHolder().getFormWrapper().classList.add('invisible');
        this.setVisible(false);
    };

    ImageGeneratorView.prototype.enableControls = function(enabled){
        var elements = this.getViewHolder().getForm().elements;
        for(var i = 0; i < elements.length; i++){
            elements[i].disabled = !enabled;
        }
    };

    ImageGeneratorView.prototype.attachEvents = function(){
        var view = this;
        var viewHolder = view.getViewHolder();
        this.getViewHolder().getShowFormButton().classList.remove('btn-disabled');

       viewHolder.getShowFormButton().addEventListener('click', function(){
           view.setActiveShowFormButton(false);
           if(!view.isFormVisible()) {
                view.show();
            }
        });

        viewHolder.getCloseButton().addEventListener('click', function(){
            if(view.isFormVisible()) {
                view.hide();
            }
        });

        viewHolder.getForm().addEventListener('submit', function(e){
            e.preventDefault();
            view.getPresenter().regenerate(this.elements);
            return false;
        });

        ImageGeneratorView.prototype.showProgressBar = function(){
            this.enableControls(false);
            this.getViewHolder().getProgressForm().classList.remove('invisible');
        };

        ImageGeneratorView.prototype.hideProgressBar = function(){
            this.enableControls(true);
            this.getViewHolder().getProgressForm().classList.add('invisible');
            this.getViewHolder().getProgressForm().children[0].innerText = "";
            this.getViewHolder().getProgressForm().children[1].setAttribute('value', 0);
        };

        ImageGeneratorView.prototype.setProgress = function(step){
            var parent = this.getViewHolder().getProgressForm();
            parent.children[0].innerText = step.data;
            parent.children[1].setAttribute('value', step.progress);
        };

    };

    var ViewHolder = function(){
        this.getShowFormButton = function(){
            return document.getElementById('show_image_generator_form');
        };
        this.getParent = function(){
            return document.getElementById('forms');
        };
        this.getForm = function(){
            return document.getElementById('image_generator_form');
        };
        this.getFormWrapper = function(){
           return document.getElementById('image_generator_form_wrapper');
        };
        this.getCloseButton = function(){
            return document.getElementById('close_generator_form');
        };
        this.getProgressForm = function(){
            return document.getElementById('regeneration_progress')
        };
    };