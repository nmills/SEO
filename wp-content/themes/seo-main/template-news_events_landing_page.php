<?php
/*
Template Name: News and Events Landing Page
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'news-events-landing-page.twig' );

$context['post'] = $post;

Timber::render( $templates, $context );