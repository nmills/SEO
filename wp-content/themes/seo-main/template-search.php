<?php
/*
  Template Name: Search Page
*/

$context = Timber::get_context();
$post = Timber::get_post();
$context['post'] = $post;
$templates = array( 'search.twig' );
Timber::render($templates, $context);