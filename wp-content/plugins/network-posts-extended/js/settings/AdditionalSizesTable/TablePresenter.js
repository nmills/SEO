/**
 * Created by Andrew on 12.09.2016.
 */
    function TablePresenter(view) {
        var tableView = view;
        this.getView = function () {
            return tableView;
        };
        var sizes = null;
        this.getSizes = function(){
            return sizes;
        };

        this.setSizes = function(list){
            sizes = list;
        };
        this.onItemsLoadedListener = null;
        this.onItemRemovedListener = null;
    }

    TablePresenter.prototype.setOnItemsLoadedListener = function(callback){
        this.onItemsLoadedListener = callback;
    };

    TablePresenter.prototype.setOnRemoveItemListener = function(callback){
        this.onItemRemovedListener = callback;
    };

    TablePresenter.prototype.loadData = function () {
        var presenter = this;
        Ajax.loadEntries(
            function (sizes) {
                presenter.setSizes(sizes);
                if(presenter.onItemsLoadedListener && presenter.onItemsLoadedListener instanceof Function){
                    presenter.onItemsLoadedListener(sizes);
                }
                var currentRequest = this;
                var tableView = presenter.getView();
                tableView.showLoadingRow(0, false);
                tableView.setLoaded(true);
                if(sizes && sizes.length > 0) {
                    tableView.setItems(sizes);
                }
                else {
                    tableView.showEmptyMessage();
                }
            },
            function(statusCode){
                if(statusCode == 204) {
                    presenter.getView().removeRow(0);
                    presenter.getView().showEmptyMessage();
                }
                presenter.getView().setLoaded(true);
            }
        );
    };
    TablePresenter.prototype.updateRow = function (rowIndex, itemId) {

    };
    TablePresenter.prototype.removeItem = function (rowIndex, itemId) {
        this.getView().showLoadingRow(rowIndex, true);
        var presenter = this;
        Ajax.removeEntry(itemId, function () {
            var currentRequest = this;
            if (currentRequest.readyState == 4 && currentRequest.status == 200) {
                presenter.getView().removeRow(rowIndex);
                if(presenter.onItemRemovedListener instanceof Function){
                    presenter.onItemRemovedListener(rowIndex);
                }
            }
        });
    };
