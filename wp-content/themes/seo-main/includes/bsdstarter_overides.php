<?php
function add_query_vars_filter( $vars ){
  $vars[] = "include_blog";
  $vars[] = "taxonomy";
  return $vars;
}
add_filter( 'query_vars', 'add_query_vars_filter' );

function generate_links_of_sites(){
  $current_page_link = get_permalink();
  $current_page_link = rtrim($current_page_link,'/');
  $all_sites = wp_get_sites();
  $selected = get_query_var('include_blog' , 'all');

  if($selected == 'all') {
    $selected_site_name = 'All';
  }
  else{
    switch_to_blog($selected);
    $selected_site_name = get_bloginfo('name');
    restore_current_blog();
  }


  $filter_site = "<h3>Program: </h3>";
  $filter_site .= "<span id='selected'>".$selected_site_name."</span>";
  $filter_site .= "<ul class='c-news-filter__items' id='selection-options'>";

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
    $filter_site .= "<a href='".$current_page_link.'?include_blog='.$site['blog_id']."#filter-news'>".$site_name."</a>";
    $filter_site .= "</li>";
  }

  if($selected == 'all') {
    $class = 'active-selected';
  }
  else{
    $class = '';
  }
  
  $filter_site .= "<li class='c-news-filter__item ".$class."'>";
  $filter_site .= "<a href='".$current_page_link."#filter-news'>All</a>";
  $filter_site .= "</li>";

  $filter_site .= "</ul>";

  return $filter_site;
}


function generate_links_of_taxonomies_news(){
  $current_page_link = get_permalink();
  $current_page_link = rtrim($current_page_link,'/');
  $terms = get_terms( array(
    'taxonomy' => 'type',
    'hide_empty' => false,
  ) );

  $selected = get_query_var('taxonomy' , null);

  if($selected == null) {
    $selected_type_name = 'All';
  }
  else{
    $selected_type_taxonomy = get_term_by('slug', $selected , 'type');
    $selected_type_name = $selected_type_taxonomy->name;
  }

  $filter_type = "<h3>Type: </h3>";
  $filter_type .= "<span id='selected'>".$selected_type_name."</span>";
  $filter_type .= "<ul class='c-news-filter__items' id='selection-options'>";


  foreach ($terms as $term) {
    if($selected == $term->slug) {
      $class = 'active-selected';
    }
    else{
      $class = '';
    }

    $filter_type .= "<li class='c-news-filter__item ".$class."'>";
    $filter_type .= "<a href='".$current_page_link.'?taxonomy='.$term->slug."#filter-news'>".$term->name."</a>";
    $filter_type .= "</li>";
  }

  if($selected == null) {
    $class = 'active-selected';
  }
  else{
    $class = '';
  }
  
  $filter_type .= "<li class='c-news-filter__item ".$class."'>";
  $filter_type .= "<a href='".$current_page_link."#filter-news'>All</a>";
  $filter_type .= "</li>";

  $filter_type .= "</ul>";

  return $filter_type;
}