<?php
/*
	Template Name: Program Homepage
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'program-home-page.twig' );

$context['post'] = $post;

/* Wiring Recent News and events */
$args = array(
  'post_type' => 'news',
  'posts_per_page'=> 3,
  'order' => 'DESC',
  'meta_query' => array(
		array(
			'key' => '_is_ns_featured_post',
			'compare' => 'NOT EXISTS'
		)
	),
);
$context['recent_posts'] = Timber::get_posts($args);


Timber::render( $templates, $context );