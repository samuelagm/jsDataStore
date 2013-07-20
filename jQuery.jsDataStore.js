(function (window, $) {

    'use strict';

    //var jsDataStore = new _jsDataStore(container, options);

    $.fn.jsDataStore = function (options) {

        var $this = $(this);
        $this.data('jds', new _jsDataStore($this, options));

    }

    var _jsDataStore = function (container, options) {
        
        this._callbacks = options.callbacks || {};
        this._config = options;
        this._currentpage = 0;
        this._datasource = this._config.data || {};
        this._bindControls();
        this._dataCB(this._firstpage());
    }

    var _P = _jsDataStore.prototype;

    //_P._pageindex = function (recordindex) {
    //    return { index: (Math.floor(recordindex / this._config.pageLength) * this._config.pageLength), offset: (recordindex % this._config.pageLength) };
    //}
			
    _P._cache = [];

    _P._page = function (index, data, isLast, length) {

        this.data = data;
        this.isLast = isLast;
        this.length = length;
        this.index = index;

    };


    _P._firstpage = function () {

        var index = 0,
            data = this._datasource.slice(index, (index + this._config.pageLength)),
            last = (index >= (this._datasource.length - length)) ? true : false;

        this._firstpageCB();
        this._currentpage = index;

        return (new this._page( (index / this._config.pageLength), data, last, this._config.pageLength));

    };

    _P._lastpage = function () {

        var index = Math.floor(this._datasource.length / this._config.pageLength) * this._config.pageLength,
            data = this._datasource.slice(index);

        this._lastpageCB();
        this._currentpage = index; //updates datastore page index
        //console.log(data);
        return (new this._page((index / this._config.pageLength), data, true, this._config.pageLength));

    };

    _P._nextpage = function () {

        var index = this._currentpage + this._config.pageLength, //look ahead
            nindex = this._datasource.length - this._config.pageLength,
            data = [],
            last = false;

        if (index < this._datasource.length) {

            if (index >= (nindex)) {

                console.log('index', index);
                console.log('currentpage', this._currentpage);
                console.log('nindex', nindex);

                data = this._datasource.slice(index);
                //console.log('data', data);
                //index = (0 - this._config.pageLength); //circle back to page 1
                index = this._currentpage; //index taken 1 step back, to prevent an empty last page
                console.log('index after', index);
                last = true;

                this._lastpageCB();

            } else {
                data = this._datasource.slice(index, (index + this._config.pageLength));
            }

            this._currentpage = index; //updates datastore page index

            return (new this._page((index / this._config.pageLength), data, last, this._config.pageLength));

        } else {
            return (this._lastpage());
        }

    };


    _P._prevpage = function () {

        var length = this._config.pageLength,
            index = this._currentpage - this._config.pageLength,
            nindex = this._datasource.length - this._config.pageLength,
            data = [],
            last = false;

        if (index <= 0) {

            index = 0;
            data = this._datasource.slice(index, (index + this._config.pageLength));
            last =  false;
            this._firstpageCB();

        } else {

            data = this._datasource.slice(index, (index + this._config.pageLength));
            last = (index >= (nindex)) ? true : false;
        }

        if (last)
            this._lastpageCB();

        this._currentpage = index; //updates datastore page index

        return (new this._page((index / this._config.pageLength), data, last, this._config.pageLength));

    };

    _P._getrecord = function (term) {

        var j,
            index = 0,
            offset = 0,
            matches = [],
            last = false,
            length = this._config.pageLength,
            datasource = this._datasource;

        if (typeof datasource[0][this._config.searchField] != 'string')
            return;

        for (j = datasource.length; j--  ;) {
                
            if (datasource[j][this._config.searchField].toLowerCase().match(term.toLowerCase()) != null) {
                matches.push(datasource[j]);

            }
           

        }

        return (new this._page(0, matches, true, matches.length));

    };


    _P._bindControls = function () {
        var _self = this,
            controls = this._config.controls;

        $(controls.first).click(function (e) {
            _self._dataCB(_self._firstpage());
        });

        $(controls.next).click(function (e) {
            _self._dataCB(_self._nextpage());
        });

        $(controls.prev).click(function (e) {
            _self._dataCB(_self._prevpage());
        });
        $(controls.last).click(function (e) {
            _self._dataCB(_self._lastpage());
        });

        $(controls.searchBtn).click(function (e) {
            var page = {};

            if ($(controls.searchInput).val().length === 0) {
                return false;
            }

            page = _self._getrecord($(controls.searchInput).val()) || {};

            if (page !== undefined) {

                _self._dataCB(page);

            } else {
                _self._noresultCB();
            }


        });
    };

    _P._dataCB = function (page) {
        this._callbacks.onData(page);
    };

    _P._firstpageCB = function () {
        this._callbacks.onFirstPage();
    };

    _P._lastpageCB = function () {
        this._callbacks.onLastPage();
    };

    _P._noresults = function () {
        this._callbacks.noSearchResult();
    };

})(this, window.jQuery);