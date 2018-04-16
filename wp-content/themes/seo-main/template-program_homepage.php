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
  'posts_per_page'=> 2,
  'order' => 'DESC'
);
$context['recent_posts'] = Timber::get_posts($args);


Timber::render( $templates, $context );