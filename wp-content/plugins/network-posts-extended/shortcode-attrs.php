<?php
/**
 * Created by PhpStorm.
 * User: Admin
 * Date: 31.05.2017
 * Time: 10:23
 */

$default_values = array(

	'limit' => '',

	'days' => 0,

	'page_title_style' => '',

	'title' => null,

	'titles_only' => false,

	'include_link_title'=> false,

	'exclude_link_title_posts'=>'',

	'wrap_start' => '',

	'wrap_end' => '',

	'thumbnail' => false,

	'post_type' => 'post',

	'include_blog' => '',

	'exclude_blog' => '',

	'exclude_post' => '',

	'include_post' => '',

	'title_length' => 999,

	'taxonomy' => '',

	'exclude_taxonomy' => '',

	'include_price' => '',

	'paginate' => false,

	'pages' => '',

	'list' => 10,

	'excerpt_length' => null,

	'excerpt_letters_length' => 400,

	'auto_excerpt' => false,

	'show_author' => false,

	'full_text' =>  false,

	'size' => 'thumbnail',

	'image_class' => 'post-thumbnail',

	'date_format' => 'n/j/Y',

	'end_size'     => '',

	'mid_size'  => '',

	'prev_next' => false,

	'prev' => '&laquo; Previous',

	'next' =>  'Next &raquo;',

	'column' => '1',

	'column_width' => '200',

	'title_color' => '',

	'text_color' => '',

	'meta_info' => 'true',

	'wrap_title_start' => '',

	'wrap_title_end' => '',

	'wrap_image_start' => '',

	'wrap_image_end' => '',

	'wrap_text_start' => '',

	'wrap_text_end' => '',

	'wrap_price_start'=>'',

	'wrap_price_end'=>'',

	'meta_width' => '100%',

	'menu_name' => '',

	'menu_class' => '',

	'container_class' => '',

	'post_height' => null,

	'manual_excerpt_length' => null,

	'manual_excerpt_letters_length' => null,

	'random' => false,

	'order_post_by' => '',

	'use_image' => '',

	'use_layout' => 'default', //there can be 2 values. if we use "default" then views/post_layout_default.php will

	//be used otherwise if we use "inline" - views/post_layout_inline.php will be used

	'align_thumbnail' => 'left', //this attribute can be "left" or "right",

	'wrap_excerpt_start' => '',

	'wrap_excerpt_end' => ''

);

$atts = shortcode_atts($default_values, $atts);

$limit = $atts['limit'];

$days = $atts['days'];

$page_title_style = $atts['page_title_style'];

$title = $atts['title'];

