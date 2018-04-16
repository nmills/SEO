<?php
/**
* Plugin Name: BSD Post Types
* Description: Custom Post Types
* Version: 1.0.0
* Author: Blue State Digital <http://www.bluestatedigital.com>
*/

function bsd_custom_post_type() {
  register_post_type( 'News', 
    array( 
      'labels' => array(
        'name' => __( 'News' ),
        'singular_name' => __( 'News' ),
        'all_items' => __( 'All News' ),
        'add_new' => __( 'Add News' ),
        'add_new_item' => __( 'Add New News' ),
        'edit' => __( 'Edit' ),
        'edit_item' => __( 'Edit News' ),
        'new_item' => __( 'New News' ),
        'view_item' => __( 'View News' ),
        'search_items' => __( 'Search News' ),
      ),
      'description' => __( 'A News or brief quote' ),
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

function create_type_taxonomy() {

    $labels = array(
        'name'              => _x( 'Type', 'taxonomy general name' ),
        'singular_name'     => _x( 'Type', 'taxonomy singular name' ),
        'search_items'      => __( 'Search Type' ),
        'all_items'         => __( 'All Type' ),
        'view_item'         => __( 'View Type' ),
        'parent_item'       => __( 'Parent type' ),
        'parent_item_colon' => __( 'Parent type:' ),
        'edit_item'         => __( 'Edit Type' ),
        'update_item'       => __( 'Update Type' ),
        'add_new_item'      => __( 'Add New Type' ),
        'new_item_name'     => __( 'New Ttype Name' ),
        'menu_name'         => __( 'types' ),
    );
    $args = array(
        'hierarchical'      => true,
        'labels'            => $labels,
        'show_ui'           => true,
        'show_admin_column' => true,
        'query_var'         => true,
        'rewrite'           => array( 'slug' => 'type' ),
    );

    $posttypes = array( 'news' );
    register_taxonomy( 'type', $posttypes, $args );
}

add_action( 'init', 'create_type_taxonomy' );

// Debug pointer