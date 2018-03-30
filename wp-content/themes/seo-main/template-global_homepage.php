<?php
/*
Template Name: Global Home page
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'global-home-page.twig' );

$context['post'] = $post;

Timber::render( $templates, $context );