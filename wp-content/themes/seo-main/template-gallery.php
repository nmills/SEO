<?php
/*
Template Name: Gallery
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'gallery.twig' );

$context['post'] = $post;

Timber::render( $templates, $context );