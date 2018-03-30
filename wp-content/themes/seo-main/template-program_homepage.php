<?php
/*
Template Name: Program Home page
*/

$context = Timber::get_context();
$post = Timber::get_post();

$templates = array( 'program-home-page.twig' );

$context['post'] = $post;

Timber::render( $templates, $context );