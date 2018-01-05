<?php
/**
* Plugin Name: BSD Post Types
* Description: Custom Post Types
* Version: 1.0.0
* Author: Blue State Digital <http://www.bluestatedigital.com>
*/

function bsd_custom_post_type() {
  register_post_type( 'call_to_action', 
    array( 
      'labels' => array(
        'name' => __( 'Calls to Action' ),
        'singular_name' => __( 'Call to Action' ),
        'all_items' => __( 'All Calls to Action' ),
        'add_new' => __( 'Add New' ),
        'add_new_item' => __( 'Add New Call to Action' ),
        'edit' => __( 'Edit' ),
        'edit_item' => __( 'Edit Call to Action' ),
        'new_item' => __( 'New Call to Action' ),
        'view_item' => __( 'View Call to Action' ),
        'search_items' => __( 'Search Calls to Action' ),
      ),
      'description' => __( 'A lightbox or meerkat' ),
      'public' => true,
      'exclude_from_search' => true,
      'show_ui' => true,
      'hierarchical' => false,
      'supports' => array( 'title', 'thumbnail' ),
      'menu_icon' => 'dashicons-megaphone'
    )
  );

  register_post_type( 'people', 
    array( 
      'labels' => array(
        'name' => __( 'People' ),
        'singular_name' => __( 'Person' ),
        'all_items' => __( 'All People' ),
        'add_new' => __( 'Add New' ),
        'add_new_item' => __( 'Add New Person' ),
        'edit' => __( 'Edit' ),
        'edit_item' => __( 'Edit Person' ),
        'new_item' => __( 'New Person' ),
        'view_item' => __( 'View People' ),
        'search_items' => __( 'Search People' ),
      ),
      'description' => __( 'A person such as a staff or board member' ),
      'public' => true,
      'exclude_from_search' => false,
      'show_ui' => true,
      'hierarchical' => false,
      'supports' => array( 'title', 'thumbnail', 'editor', 'slug' ),
      'rewrite' => array( 'slug' => 'people', 'with_front' => false ),
      'has_archive' => 'people',
      'capability_type' => 'post',
      'menu_icon' => 'dashicons-admin-users'
    )
  );

  register_post_type( 'testimonial', 
    array( 
      'labels' => array(
        'name' => __( 'Testimonials' ),
        'singular_name' => __( 'Testimonial' ),
        'all_items' => __( 'All Testimonials' ),
        'add_new' => __( 'Add New' ),
        'add_new_item' => __( 'Add New Testimonial' ),
        'edit' => __( 'Edit' ),
        'edit_item' => __( 'Edit Testimonial' ),
        'new_item' => __( 'New Testimonial' ),
        'view_item' => __( 'View Testimonial' ),
        'search_items' => __( 'Search Testimonials' ),
      ),
      'description' => __( 'A testimonial or brief quote' ),
      'public' => true,
      'exclude_from_search' => true,
      'show_ui' => true,
      'hierarchical' => false,
      'supports' => array( 'title', 'thumbnail' ),
      'menu_icon' => 'dashicons-format-quote'
    )
  );
}

add_action( 'init', 'bsd_custom_post_type');
