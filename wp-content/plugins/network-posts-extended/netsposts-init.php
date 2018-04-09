<?php
############  SETUP  ####################

add_action( 'init', 'netsposts_init' );
add_action( 'admin_init', 'netsposts_multisite_init' );
add_action( 'wpmu_new_blog', 'activate_new_blog_plugin' );
add_action( "plugins_loaded", "net_shared_posts_init" );
add_shortcode( 'netsposts', 'netsposts_shortcode' );
add_action( 'admin_menu', 'add_netsposts_toolpage' );
add_action( 'admin_enqueue_scripts', 'netsposts_init_settings_page' );

//This variable is needed for WP_EStore thumbnails

$img_sizes;

/*

 * Custom thumbnail maximum width

 */

define( 'DEFAULT_THUMBNAIL_WIDTH', 300 );
define( 'BASE_JS_PATH', plugins_url( '/network-posts-extended/js' ) );
define( 'POST_VIEWS_PATH', plugin_dir_path( __FILE__ ) . 'views/post' );
define( 'MAIN_PLUGIN_FILE', 'network-posts-extended/network-posts-extended.php' );

require_once 'components/class-shortcode-manager.php';
require_once 'components/class-single-posts-query.php';
require_once 'components/netsposts-utils.php';