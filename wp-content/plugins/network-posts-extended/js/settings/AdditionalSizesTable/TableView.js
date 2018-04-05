/**
 * Created by Andrew on 12.09.2016.
 */
    function TableView() {
        var table = document.getElementById('sizes_table');
        var modifyingRowNum = -1;
        var emptyTable = true;
        var isLoaded = false;

        this.getModifyingRowNum = function(){
            return modifyingRowNum;
        };

        this.setModifyingRowNum = function(rowNum){
            modifyingRowNum = rowNum;
        };

        this.isDataLoaded = function(){
            return isLoaded;
        };

        this.setLoaded = function(loaded){
            isLoaded = loaded;
        };

        this.isEmptyTable = function(){
            return emptyTable;
        };

        this.setEmptyTable = function(isEmpty){
            emptyTable = isEmpty;
        };

        var presenter = new TablePresenter(this);

        this.getPresenter = function(){
            return presenter;
        };

        this.getTable = function () {
            return table;
        };
        this.OnRemoveItemListener = null;
        this.OnEditItemListener = null;
    }

    TableView.prototype.loadItems = function () {
        this.showLoadingRow(0, true);
        this.getPresenter().loadData();
    };

    TableView.prototype.setItems = function (items) {
        var lastColumn = this.getTable().children[0].children[0].children.length - 1;
        for (var i = 0; i < items.length; i++) {
            this.addRow(items[i]);
        }
    };


    TableView.prototype.addRow = function (entry, selectColor) {
        var rowNum = this.getRowsCount();
        var row = createRow(rowNum, entry);
        attachEventListeners(this, row);
        if(selectColor){
            row.style.backgroundColor = selectColor;
            setTimeout(function(){
                row.style.backgroundColor = '';
            }, 300);
        }
        this.getTable().children[1].appendChild(row);
    };
    TableView.prototype.removeRow = function (index) {
        var table = this.getTable();
        if (index < table.children[1].children.length) {
            table.children[1].removeChild(table.children[1].children[index]);
            if (table.children[1].children.length == 0)
                this.showEmptyMessage();
        }
    };
    TableView.prototype.updateRow = function (item) {
        var index = this.getModifyingRowNum();
        var row = this.getTable().children[1].children[index];
        row.style.backgroundColor = '#efefef';
        modifyRow(row, item);
        window.setTimeout(function(){
            row.style.backgroundColor = '#fff';
        }, 200)
        this.setModifyingRowNum(-1);
    };
    TableView.prototype.showLoadingRow = function (index, isShown) {
        if(isShown) {
            if (index < this.getTable().children[1].children.length) {
                this.getTable().children[1].children[index].innerHTML = '<td style="text-align:center;" colspan="7" class="loading-row"><img src="' + data.loading_gif + '" alt="loading"/></td>';
            }
            else this.getTable().children[1].innerHTML = '<tr class="loading-row"><td style="text-align:center;" colspan="7"><img src="' + data.loading_gif + '" alt="loading"/></td></tr>'
        }
        else{
            if (index < this.getTable().children[1].children.length) {
                this.getTable().children[1].removeChild(this.getTable().children[1].children[index]);
            }
        }
    };
    TableView.prototype.showEmptyMessage = function () {
        this.setEmptyTable(true);
        this.getTable().children[1].innerHTML = '<tr id="empty_row"><td colspan="7" style="text-align: center;height:150px;" id="empty_list">' + data.empty_table + '</td></tr>';
    };

    TableView.prototype.hideEmptyMessage = function () {
        this.setEmptyTable(false);
        var row = this.getTable().children[1].children[0];
        if(row.id == 'empty_row')
            this.getTable().children[1].removeChild(row);
    };

    TableView.prototype.showErrorMessage = function (message) {
        this.getTable().children[1].innerHTML = '<tr><td colspan="7" style="text-align: center">' + message + '</td></tr>';
    };

    TableView.prototype.setOnRemoveItemListener = function (callback) {
        this.OnRemoveItemListener = callback;
    };

    TableView.prototype.setOnEditItemListener = function (callback) {
        this.OnEditItemListener = callback;
    };

    TableView.prototype.getRowsCount = function(){
        return this.getTable().children[1].children.length;
    };

    var createTableCell = function (data) {
        if (data != undefined && data != null)
            return '<td>' + data + '</td>';
        return '<td></td>';
    };

    var createActionsCell = function (rowIndex, itemId) {
        var td = document.createElement('td');
        var ul = document.createElement('ul');
        ul.innerHTML += '<li><a href="#' + itemId + '" id="edit" data-row-num="' + rowIndex + '">Edit</a></li>';
        ul.innerHTML += '<li><a href="#' + itemId + '" id="remove" data-row-num="' + rowIndex + '">Remove</a></li>';
        td.appendChild(ul);
        return td;
    };

    function modifyRow(row, newModel){
        var cells = row.children;
        cells[0].innerText = getModelValue(newModel.data, 'name');
        cells[1].innerText = getModelValue(newModel.data, 'alias');
        cells[2].innerText = getModelValue(newModel.data, 'width');
        cells[3].innerText = getModelValue(newModel.data, 'height');
        cells[4].innerText = getModelValue(newModel.data, 'crop');
        if (newModel.data.crop_x && newModel.data.crop_y)
            cells[5].innerText = newModel.data.crop_x + ";" + newModel.data.crop_y;
        else cells[5].innerText = '';
    }

    function getModelValue(model, key){
        if(model[key])
            return model[key];
        else return '';
    }

    function createRow(index, entry){
        if (entry != undefined && entry != null) {
            var tableRow = document.createElement('tr');
            tableRow.innerHTML += createTableCell(entry.data.name);
            tableRow.innerHTML += createTableCell(entry.data.alias);
            tableRow.innerHTML += createTableCell(entry.data.width);
            tableRow.innerHTML += createTableCell(entry.data.height);
            tableRow.innerHTML += createTableCell(entry.data.crop);
            if (entry.data.crop_x != undefined && entry.data.crop_y != undefined)
                tableRow.innerHTML += '<td>' + entry.data.crop_x + ";" + entry.data.crop_y + '</td>';
            else tableRow.innerHTML += '<td></td>';
            tableRow.appendChild(createActionsCell(index, entry.id));
            return tableRow;
        }
        else return '';
    }

    function editRowClick(view, e){
        e.preventDefault();
        var rowNum = e.target.getAttribute('data-row-num');
        if (rowNum) {
            var id = e.target.hash.substring(1);
            if (view.OnEditItemListener) {
                view.OnEditItemListener(rowNum, id);
                view.setModifyingRowNum(rowNum);
            }
        }
    }

    function removeRowClick(view, e){
        e.preventDefault();
        var rowNum = e.target.getAttribute('data-row-num');
        if (rowNum != null) {
            var id = e.target.hash.substring(1);
            view.getPresenter().removeItem(rowNum, id);
            if (view.OnRemoveItemListener)
                view.OnRemoveItemListener(rowNum, id);
        }
    }

    function attachEventListeners(view, row){
        var td = row.children[row.children.length - 1];
        var links = td.children[0].children;
        links[0].children[0].addEventListener('click', function(e){
            editRowClick(view, e);
        });
        //remove size
        links[1].children[0].addEventListener('click', function(e){
            removeRowClick(view, e);
        });
    }