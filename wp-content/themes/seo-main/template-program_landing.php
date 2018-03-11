<?php
/*
Template Name: Program Landing
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'program-landing-page.twig' );

$context['post'] = $post;

Timber::render( $templates, $context );