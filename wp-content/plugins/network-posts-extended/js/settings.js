(function(){
    function init() {
        var tableView = new TableView();
        var formView = new FormView();
        var imagesGeneratorView = new ImageGeneratorView();

        formView.init();
        imagesGeneratorView.init();

        tableView.setOnEditItemListener(function(rowNum, id){
            formView.showForId(id);
        });
        tableView.getPresenter().setOnItemsLoadedListener(function(items){
            imagesGeneratorView.getPresenter().setSizes(items);
        });
        tableView.getPresenter().setOnRemoveItemListener(function(index){
           imagesGeneratorView.getPresenter().remove(index);
        });

        tableView.loadItems();

        formView.setOnEntryCreatedListener(function(entry){
            if(tableView.isDataLoaded()){
                if(tableView.isEmptyTable()) {
                    tableView.hideEmptyMessage();
                }
                tableView.addRow(entry,'#EEE');
            }
            var buttonsWrapper = document.getElementById('buttons');
            if(buttonsWrapper.children.length == 2){
                var label = document.createElement('label');
                label.innerText = 'You need to refresh this page.';
                buttonsWrapper.appendChild(label);
            }
        });

        formView.setOnEntryUpdatedListener(function(entry){
            tableView.updateRow(entry);
            imagesGeneratorView.setActiveShowFormButton(true);
        });
    }

    document.addEventListener('DOMContentLoaded', init());
})();
