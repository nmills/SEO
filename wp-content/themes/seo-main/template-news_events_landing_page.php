<?php
/*
Template Name: News and Events Landing Page
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'news-events-landing-page.twig' );

$context['post'] = $post;

$context['site_filter_NE_landingpage'] = generate_links_of_sites();
$context['tags_filter_NE_landingpage'] = generate_links_of_taxonomies_news();
Timber::render( $templates, $context );