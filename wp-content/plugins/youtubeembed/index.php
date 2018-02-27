<?php

/*
Plugin Name: YoutubeEmbed
Description: Custom Plugin By Amalan
Version: 0.0.1
Author: Amalan Premkumar
*/

$plugin_label = "Youtube Embed";
$plugin_slug = "youtube_embed";

class simple_tooltips {

    public function __construct(){
    	
		global $plugin_label, $plugin_slug;
		$this->plugin_slug = $plugin_slug;
		$this->plugin_label = $plugin_label;
		$this->custom_tooltips = array();
		
		add_shortcode('simple_tooltip', array($this, 'addShortcodeHandler'));
		
		add_filter( 'tiny_mce_version', array($this, 'my_refresh_mce'));
		
		add_action('init', array($this, 'add_custom_button')); 
		
    }
	
	function my_refresh_mce($ver) {
	  $ver += 6;
	  return $ver;
	}
	
	function add_custom_button() {
	   if ( ! current_user_can('edit_posts') && ! current_user_can('edit_pages') )
		 return;
	   if ( get_user_option('rich_editing') == 'true') {
		 add_filter('mce_external_plugins', array($this, 'add_custom_tinymce_plugin'));
		 add_filter('mce_buttons', array($this, 'register_custom_button'));
	   }
	}
	
	function register_custom_button($buttons) {
	   array_push($buttons, "|", get_class($this));
	   return $buttons;
	}
	
	function add_custom_tinymce_plugin($plugin_array) {
	  //use this in a plugin
	  $plugin_array[get_class($this)] = plugins_url( 'editor_plugin.js' , __FILE__ );
	  return $plugin_array;
	}
} //end class

new simple_tooltips();