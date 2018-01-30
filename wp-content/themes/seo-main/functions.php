<?php

if ( ! class_exists( 'Timber' ) ) {
  add_action( 'admin_notices', function() {
    echo '<div class="error"><p>Timber not activated. Make sure you activate the plugin in <a href="' . esc_url( admin_url( 'plugins.php#timber' ) ) . '">' . esc_url( admin_url( 'plugins.php' ) ) . '</a></p></div>';
  } );
  return;
}

class BSDStarterSite extends TimberSite {

  function __construct() {
    add_theme_support( 'title-tag' );
    add_theme_support( 'post-thumbnails' );
    add_theme_support( 'menus' );
    add_action( 'init', array( $this, 'cleanup_header' ) );
    add_action( 'init', array( $this, 'add_menus' ) );
    add_filter( 'timber_context', array( $this, 'add_to_context' ) );
    add_action( 'wp_enqueue_scripts', array( $this, 'add_styles_and_scripts' ), 999 );
    add_action( 'widgets_init', array( $this, 'add_sidebars' ) );
    parent::__construct();
  }

  function cleanup_header() {
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'index_rel_link' );
    remove_action( 'wp_head', 'wp_generator' );
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
    remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
    remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
  }

  function add_to_context ( $context ) {
    $context['menu'] = new TimberMenu('header-menu');
    $context['site'] = $this;
    $context['footer_widgets'] = Timber::get_widgets('footer_widgets');
    $cta = Timber::get_post( array(
      'post_type' => 'call_to_action',
      'post_status' => 'publish'
    ) );
    if ( $cta ) {
      $context['cta'] = Timber::render( 'cta-' . $cta->call_to_action_type . '.twig', array('post' => $cta), false );
    }
    //Adding the logo
    $context['logo'] = logo();
    //Adding the default search term
    $context['searchterm'] = get_search_query();
    //Adding Header Widget
    $context['header_widget'] = Timber::get_widgets('header_widget');
    return $context;
  }

  function add_styles_and_scripts() {
    global $wp_styles;

    if (!is_admin()) {
      wp_deregister_script('jquery');
      wp_enqueue_script( 'jquery', get_stylesheet_directory_uri() . '/src/js/vendor/jquery.js', array(), '2.1.14', false );
      wp_enqueue_script( 'site-js', get_stylesheet_directory_uri() . '/assets/js/source.dev.js', array( 'jquery' ), '0.0.3', true );

      //Adding child style css and making sure that it loads after the parent css so that it can be overidden for smaller tweaks.
      $parent_style = 'parent-style';
      wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
      wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style ),
        wp_get_theme()->get('Version')
      );
    }


  }

  function add_sidebars() {
    register_sidebar(array(
      'id' => 'footer_widgets',
      'name' => __('Footer'),
      'description' => __('Widgets in the site global footer'),
      'before_widget' => '',
      'after_widget' => ''
    ));

    register_sidebar( array(
      'id' => 'header_widget',
      'name' => 'Header Widget',
      'before_widget' => '<div class="header-widget-area">',
      'after_widget' => '</div>',
      'before_title' => '<h2 class="header-widget-area-title">',
      'after_title' => '</h2>',
      ) 
    );

    register_sidebar(array(
      'id' => 'sidebar',
      'name' => __('Default Sidebar'),
      'description' => __('Default sidebar for interior pages'),
      'before_widget' => '',
      'after_widget' => '',
      'before_title' => '<h3>',
      'after_title' => '</h3>'
    ));

    register_sidebar(array(
      'id' => 'sidebar_blog',
      'name' => __('Blog Sidebar'),
      'description' => __('Special sidebar for the blog'),
      'before_widget' => '',
      'after_widget' => '',
      'before_title' => '<h3>',
      'after_title' => '</h3>'
    ));
  }

  function add_menus() {
    register_nav_menus(
      array(
        'header-menu' => __( 'Header Menu' )
      )
    );
  }
}

new BSDStarterSite();


/**
* Add and get custom logo
*/
function seo_custom_logo_setup() {
    $defaults = array(
        'height'      => 100,
        'width'       => 400,
        'flex-height' => true,
        'flex-width'  => true,
        'header-text' => array( 'site-title', 'site-description' ),
    );
    add_theme_support( 'custom-logo', $defaults );
}
add_action( 'after_setup_theme', 'seo_custom_logo_setup' );

function logo() {
    $custom_logo_id = get_theme_mod( 'custom_logo' );
    $logo = wp_get_attachment_image_src( $custom_logo_id , 'full' );

    return $logo;
}

/**
* Our custom post type function
*/
function create_posttype() {
 
    register_post_type( 'seo_documents',
        array(
            'labels' => array(
                'name' => __( 'SEO Documents' ),
                'singular_name' => __( 'Seo Document' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'seo_documents'),
        )
    );

     register_taxonomy(
       'file',
       array('seo_documents',),
       array(
         'label' => __( 'File' ),
         'rewrite' => array(
           'slug' => 'file',
           'with_front' => false
         ),
         'hierarchical' => true
       )
     );
}
// Hooking up our function to theme setup
add_action( 'init', 'create_posttype' );

/**
* Returns the sidebar id for the page, based on page section
*/
function bsdstarter_get_sidebar_slug( $post ) {
  if ( $post->post_type == 'page' ) {
    $parents = array_reverse( get_post_ancestors( $post->ID ) );
    $slug = '_';
    // If there are no parents, the page itself is a top-level page
    if (empty($parents)) {
      $slug .= $post->post_name;
    } else {
      $ancestor = get_post($parents[0] );
      $slug .= $ancestor->post_name;
    }

    return $slug;
  }

  // For blog posts, get the blog sidebar
  if ( $post->post_type == 'post' ) {
    return 'blog';
  }

  return '';
}

// Customize TinyMCE settings
require_once(get_template_directory() . '/includes/bsdstarter_editor_styles.php');

// Custom Shortcodes
require_once(get_template_directory() . '/includes/bsdstarter_shortcodes.php');