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

if (is_front_page()) {
    array_unshift($templates, 'home.twig');

    $context['testimonials'] = Timber::get_posts(array(
    'post_type' => 'testimonial',
    'numberposts' => 2,
    'post_status' => 'publish'
    ));

    $context['recent_posts'] = Timber::get_posts(array(
    'post_type' => 'post',
    'numberposts' => 5,
    'post_status' => 'publish'
    ));
} else {
    $sidebar_context = array();
  // Add any data to the sidebar here
    $sidebar_slug = seo_get_sidebar_slug($post);
    if (is_active_sidebar('sidebar' . $sidebar_slug)) {
        $sidebar_context['widgets'] = Timber::get_widgets('sidebar' . $sidebar_slug);
    } else {
        $sidebar_context['widgets'] = Timber::get_widgets('sidebar');
    }

    $context['sidebar'] = Timber::get_sidebar('sidebar.twig', $sidebar_context);
}

if (post_password_required($post->ID)) {
    //action URL for the post-level password protection form
    $context['password_form_action_url'] = add_query_arg('action', 'postpass', wp_login_url());
    Timber::render('single-password.twig', $context);
} else {
    Timber::render($templates, $context);
}
