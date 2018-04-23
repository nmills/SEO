/**
* Search Bar
*/

export default function() {
  var searchForm = $('.c-searchform--header');
  var searchFormResults = $('.c-searchform--results');
  var searchBtn = $('.js-search-btn');
  var searchBtnResults = $('.js-search-filter__btn');
  var searchBtnClose = $('.c-searchform--header .c-searchform__close-btn');
  var searchBtnCloseResults = $('.c-searchform--results .c-searchform__close-btn');

  if(searchForm.length) {
    searchBtn.click(function (e) {
      e.preventDefault();
      searchForm.addClass('active');
    });

    searchBtnClose.click(function (e){
      e.preventDefault();
      searchForm.removeClass('active');
    });
  }

  if(searchFormResults.length) {
    searchBtnResults.click(function (e) {
      e.preventDefault();
      searchFormResults.addClass('active');
    });

    searchBtnCloseResults.click(function (e){
      e.preventDefault();
      searchFormResults.removeClass('active');
    });
  }
}