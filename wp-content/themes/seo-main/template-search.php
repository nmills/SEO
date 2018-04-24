<?php
/*
  Template Name: Search Page
*/

$context = Timber::get_context();
$post = Timber::get_post();
$context['post'] = $post;
// $context['facet_categories'] = facetwp_display('facet', 'search_categories');
// $context['posts'] = facetwp_display('template', 'search_posts');
// $context['pagination'] = facetwp_display('pager');
// $context['facet_search'] = facetwp_display('facet', 'facet_search');
$templates = array( 'search.twig' );
Timber::render($templates, $context);