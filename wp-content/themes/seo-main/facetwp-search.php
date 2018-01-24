<?php
$context = Timber::get_context();
// $context['posts'] = Timber::get_posts();
$posts = Timber::get_posts();
$context['posts'] = $posts;

$templates = array( 'partials/search-teaser.twig' );

Timber::render($templates, $context);
