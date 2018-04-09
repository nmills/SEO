<?php
function add_query_vars_filter( $vars ){
  $vars[] = "include_blog";
  return $vars;
}
add_filter( 'query_vars', 'add_query_vars_filter' );


function generate_links_of_sites(){
  $current_page_link = get_permalink();
  $filter_site = "";
  $all_sites = wp_get_sites();
  $selected = get_query_var('include_blog' , 'all');

  foreach ($all_sites as $site) {
    switch_to_blog($site['blog_id']);
    $site_name = get_bloginfo('name');
    restore_current_blog();

    if($selected == $site['blog_id']) {
      $class = 'active-selected';
    }
    else{
      $class = '';
    }

    $filter_site .= "<li class='c-news-filter__item ".$class."'>";
    $filter_site .= "<a href='".$current_page_link.'?include_blog='.$site['blog_id']."'>".$site_name."</a>";
    $filter_site .= "</li>";
  }

  if($selected == 'all') {
    $class = 'active-selected';
  }
  else{
    $class = '';
  }
  
  $filter_site .= "<li class='c-news-filter__item ".$class."'>";
  $filter_site .= "<a href='".$current_page_link."'>All</a>";
  $filter_site .= "</li>";

  return $filter_site;
}


// function generate_links_of_taxonomies_news(){
//   $terms = get_terms( array(
//     'taxonomy' => 'type',
//     'hide_empty' => false,
//   ) );

  // print_r($terms);

  // $current_page_link = get_permalink();
  // $filter_site = "<a href='".$current_page_link."'>All</a>";
  // $all_sites = wp_get_sites();

  // // $selected = get_query_var();
  // foreach ($all_sites as $site) {
  //   switch_to_blog($site['blog_id']);
  //   $site_name = get_bloginfo('name');
  //   restore_current_blog();

  //   $filter_site = $filter_site."<a href='".$current_page_link.'?include_blog='.$site['blog_id']."'>".$site_name."</a>";
  // }
  // return $filter_site;
// }