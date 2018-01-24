<?php
/*
  Template Name: Search Page
*/

// $context = Timber::get_context();
// $context['posts'] = facetwp_display('template', 'posts');
// $context['pagination'] = facetwp_display('pager');
// $context['facet_search'] = facetwp_display('facet', 'search');
// $context['facet_countries'] = facetwp_display('facet', 'countries');
// $context['facet_topics'] = facetwp_display('facet', 'topics');
// $context['facet_categories'] = facetwp_display('facet', 'categories');
// $templates = array( 'search.twig' );
// Timber::render($templates, $context);

$context = Timber::get_context();
$context['facet_categories'] = facetwp_display('facet', 'search_categories');
$context['posts'] = facetwp_display('template', 'search_posts');
$context['pagination'] = facetwp_display('pager');
// $context['facet_search'] = facetwp_display('facet', 'facet_search');
$templates = array( 'search.twig' );
Timber::render($templates, $context);