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
    /* Site name */
    $context['site_name'] = get_bloginfo('name');
    $context['menu'] = new TimberMenu('header-menu');
    /* New menus are added though here for the header */
    $context['site_menu'] = new TimberMenu('site-menu');
    $context['main_menu_left'] = new TimberMenu('main-menu');
    $context['main_menu_right'] = new TimberMenu('main-menu-right');
    /* End of header menus */
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
    //Adding Side Menu Widget
    $context['side_menu_widget'] = Timber::get_widgets('side_menu_widget');

    /* Getting the featured post */
    $args = array(
      'post_type'  => 'news',
      'meta_key'   => '_is_ns_featured_post',
      'meta_value' => 'yes',
    );
    $context['featured_posts'] = Timber::get_posts($args);
    return $context;
    
  }

  function add_styles_and_scripts() {
    global $wp_styles;

    if (!is_admin()) {
      wp_deregister_script('jquery');
      wp_enqueue_script( 'jquery', get_stylesheet_directory_uri() . '/src/js/vendor/jquery.js', array(), '2.1.14', false );
      if ( get_template_directory_uri() != get_stylesheet_directory_uri()) {
        wp_enqueue_script( 'parent-site-js', get_template_directory_uri() . '/assets/js/source.dev.js', array( 'jquery' ), '0.0.3', true );

        wp_enqueue_script( 'child-site-js', get_stylesheet_directory_uri() . '/assets/js/source.dev.js', array( 'jquery' ), '0.0.3', true );
      } else {
        wp_enqueue_script( 'parent-site-js', get_template_directory_uri() . '/assets/js/source.dev.js', array( 'jquery' ), '0.0.3', true );
      }
      
      /* Adding video JS files */
        // wp_enqueue_script( 'video-player-js', get_template_directory_uri() . '/src/js/videoplayer/player.js', array( 'jquery' ), '0.0.3', true );
        // wp_enqueue_script( 'video-component-js', get_template_directory_uri() . '/src/js/videoplayer/videocomponent.js', array( 'jquery' ), '0.0.3', true );
        // wp_enqueue_script( 'rangetouch-js', get_template_directory_uri() . '/src/js/videoplayer/rangetouch.js', array( 'jquery' ), '0.0.3', true );
        // wp_enqueue_script( 'shareone-js', get_template_directory_uri() . '/src/js/videoplayer/shr.js', array( 'jquery' ), '0.0.3', true );
        /* End of Video JS files */
        /* Adding Video Styles */
        // wp_enqueue_style( 'player-style', get_template_directory_uri() . '/src/css/player.css' );
        // wp_enqueue_style( 'video-component-style', get_template_directory_uri() . '/src/css/videocomponent.css' );
        /*End of Video Styles*/
      
      //Adding child style css and making sure that it loads after the parent css so that it can be overidden for smaller tweaks.
      $parent_style = 'parent-style';
      if ( get_template_directory_uri() != get_stylesheet_directory_uri()) {
        wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
        wp_enqueue_style( 'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        array( $parent_style ),
        wp_get_theme()->get('Version')
      );
      } else {
         wp_enqueue_style( $parent_style, get_template_directory_uri() . '/style.css' );
      }
      

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

    register_sidebar( array(
      'id' => 'side_menu_widget',
      'name' => 'Side Menu Widget',
      'before_widget' => '<div class="side-menu-widget-area">',
      'after_widget' => '</div>',
      'before_title' => '<h2 class="side-menu-widget-area-title">',
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

// Adding excerpts
add_post_type_support( 'page', 'excerpt' );

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

/* Removing Add media button  */
function RemoveAddMediaButtons(){
  remove_action( 'media_buttons', 'media_buttons' );
}
add_action('admin_head', 'RemoveAddMediaButtons');