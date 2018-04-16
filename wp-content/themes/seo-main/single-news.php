<?php
/**
* Single entry template. Used for posts and other individual content items.
*
* To override for a particular post type, create a template named single-[post_type]
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'single-' . $post->ID . '.twig', 'single-' . $post->post_type . '.twig', 'single.twig' );

$context['post'] = $post;

/* Wiring Recent News and events 
	Make sure featured post and current post does not appear in the recent posts
*/

$args = array(
  'post_type' => 'news',
  'posts_per_page'=> 3,
  'post__not_in' => array ($post->ID),
  'meta_query' => array(
		array(
			'key' => '_is_ns_featured_post',
			'compare' => 'NOT EXISTS'
		)
	),
  'order' => 'DESC'
);
$context['recent_posts'] = Timber::get_posts($args);

Timber::render( $templates, $context );