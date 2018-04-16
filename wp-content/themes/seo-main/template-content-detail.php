<?php
/*
  Template Name: Content Detail
*/

$context = Timber::get_context();
$post = Timber::get_post($post->ID);

$templates = array( 'content-detail.twig' );

$context['post'] = $post;

Timber::render($templates, $context);
