/**
* Search Bar
*/

export default function() {
  var searchForm = $('.c-searchform');
  var searchBtn = $('.js-search-btn');
  var searchBtnClose = $('.c-searchform__close-btn');


  if(searchForm.length) {
    searchBtn.click(function (e) {
      e.preventDefault();
      searchForm.addClass('active');
    });

    searchBtnClose.click(function (e){
      e.preventDefault();
      searchForm.removeClass('active');
    })
  }
}