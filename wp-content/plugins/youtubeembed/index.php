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
		
		//enqueue color picker
		// add_action( 'admin_enqueue_scripts', array($this, 'enqueue_color_picker') );
		
		//plugin row links
		// add_filter( 'plugin_row_meta', array($this,'plugin_row_links'), 10, 2 );
		
		add_shortcode('simple_tooltip', array($this, 'addShortcodeHandler'));
		
		add_filter( 'tiny_mce_version', array($this, 'my_refresh_mce'));
		
		//add_action('init', array($this, 'add_custom_button')); 
		
		add_action('init', array($this, 'load_tooltips')); //loads on wordpress init
		
		add_action('init', array($this, 'add_custom_button')); 
		
    }
	
	function enqueue_color_picker( $hook_suffix ) {
		// first check that $hook_suffix is appropriate for your admin page
		wp_enqueue_style( 'wp-color-picker' );
		wp_enqueue_script( 'my-script-handle', plugins_url('motech-color-picker.js', __FILE__ ), array( 'wp-color-picker' ), false, true );
	}

	function load_tooltips() {
		if (!is_admin()) {
			wp_enqueue_script('simple_tooltips_base', plugins_url( 'zebra_tooltips.js' , __FILE__ ), array('jquery'), false, true);
			wp_enqueue_style('simple_tooltips_style', plugins_url( 'zebra_tooltips.css' , __FILE__ ));
			add_action('wp_footer', array($this, 'tooltip_data'), 100);
		}
	} 
	
	function tooltip_data() {
		?>
    <?php
		if(function_exists('wp_is_mobile')){
			if ( wp_is_mobile() ) {
				$on_mobile = 1;
			} else {
				$on_mobile = 0;	
			}
		} else { //old version of wp, wp_is_mobile doesn't exist, so assume user not on mobile
			$on_mobile = 0;
		}
		?>
        <?php if (!( ( get_option('simple_tooltips_disable_on_mobile', 0) == 1 ) and ($on_mobile == 1) )) : //only load on non mobile, if set to disable on mobile ?>
			<?php
            $selectors_field = get_option('simple_tooltips_menu_selectors', '');
            ?>
            
                <script type="text/javascript">
                    jQuery(function() {
                        <?php if (!empty($selectors_field)) : ?>
                            <?php
                            $pieces = explode(",", $selectors_field);
                            foreach($pieces as $piece) {
                                $selectors_string .= $piece . " .tooltips > a,";
                            }
                            $selectors_string = substr($selectors_string, 0, -1);
                            ?>
                            jQuery('<?php echo $selectors_string ?>').each(function () {
                                jQuery(this).addClass('tooltips').closest('li').removeClass('tooltips');
                            });
                        <?php endif ?>
                        
                        jQuery(".tooltips img").closest(".tooltips").css("display", "inline-block");
                    
                        new jQuery.Zebra_Tooltips(jQuery('.tooltips').not('.custom_m_bubble'), {
                            'background_color':     '<?php echo get_option('simple_tooltips_background_color', '#000000') ?>',
                            'color':				'<?php echo get_option('simple_tooltips_text_color', '#ffffff') ?>',
                            'max_width':  <?php echo get_option('simple_tooltips_max_width', 250) ?>,
                            'opacity':    <?php echo get_option('simple_tooltips_opacity', .95) ?>, 
                            'position':    '<?php echo get_option('simple_tooltips_position', 'center') ?>'
                        });
                        
                        <?php //add customized tooltips
                        $custom_tooltips = $this->custom_tooltips;
                        $custom_tooltips = array_map("unserialize", array_unique(array_map("serialize", $custom_tooltips)));
                        //$custom_tooltips = array_unique($custom_tooltips);
                        foreach($custom_tooltips as $custom_tooltip) { ?>
                            <?php
                            
                                //first get default values
                                $bgcolor = get_option('simple_tooltips_background_color', '#000000');
                                $color = get_option('simple_tooltips_text_color', '#ffffff');
                                $max_width = get_option('simple_tooltips_max_width', 250);
                                $opacity =  get_option('simple_tooltips_opacity', .95);
                                $position =  get_option('simple_tooltips_position', 'center');
                                
                                $special_classes = "";
                                //now override custom values, if there are any. the order here matters
                                if(isset($custom_tooltip["bubblewidth"])){
                                    $max_width = $custom_tooltip["bubblewidth"];
                                    $special_classes .= " bubblewidth_".$custom_tooltip["bubblewidth"];
                                }
                                if(isset($custom_tooltip["bubblebgcolor"])){
                                    $bgcolor = $custom_tooltip["bubblebgcolor"];
                                    $special_classes .= " bubblebgcolor_".$custom_tooltip["bubblebgcolor"];
                                }
                                if(isset($custom_tooltip["bubbleopacity"])){
                                    $opacity = $custom_tooltip["bubbleopacity"];
                                    $special_classes .= " bubbleopacity_".$custom_tooltip["bubbleopacity"];
                                }
                                if(isset($custom_tooltip["bubbleposition"])){
                                    $position = $custom_tooltip["bubbleposition"];
                                    $special_classes .= " bubbleposition_".$custom_tooltip["bubbleposition"];
                                }
                                if(isset($custom_tooltip["bubblecolor"])){
                                    $color = $custom_tooltip["bubblecolor"];
                                    $special_classes .= " bubblecolor_".$custom_tooltip["bubblecolor"];
                                }							
                            
                            
                            ?>
    
                            new jQuery.Zebra_Tooltips(jQuery('[class="tooltips <?php echo $special_classes ?> custom_m_bubble"]'), {
                                'background_color':     '<?php echo $bgcolor ?>',
                                'color':				'<?php echo $color ?>',
                                'max_width':  <?php echo $max_width ?>,
                                'opacity':    <?php echo $opacity ?>, 
                                'position':    '<?php echo $position ?>'
                            });
                            
                            <?php
                        }
                        ?>
                    
                    });
                </script>        
		<?php endif;
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
	
	// add the shortcode handler 
	function addShortcodeHandler($atts, $trigger = null) {
			$html = '';
			/*Custom Override*/
			$html .= '<span class="tooltip tooltip-highlight" data-tooltip="'.htmlspecialchars(do_shortcode($content)).'" data-close="x" data-hasqtip="0">'.do_shortcode($trigger).'</span>';
			return $html;
	}		
} //end class

new simple_tooltips();