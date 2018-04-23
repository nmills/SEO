<?php

/**

 * Created by PhpStorm.

 * User: Admin

 * Date: 03.04.2017

 * Time: 15:31

 */

if(!defined('POST_VIEWS_PATH')) die();

$context = Timber::get_context();
switch_to_blog($the_post['blog_id']);

  $context['result_site_name'] = get_bloginfo('name');
  $context['news_link'] = $the_post['guid'];

  $resultpost = new TimberPost($the_post['ID']);
  $context['recent_news'] = $resultpost;

  $context['header_image_url'] = get_field('header_image', $the_post['ID']);

  $templates = array( 'partials/teaser_recent_news.twig' );

restore_current_blog();
Timber::render($templates, $context);


// $align_thumbnail = $shortcode_mgr->get('align_thumbnail');



// $html .= '<div class="inline-post">';

//     $html .= "<div class='align-{$align_thumbnail} netsposts-post-thumbnail'>";

//         if($thumbnail)

//         {

//             include POST_VIEWS_PATH . '/thumbnail.php';

//             $the_post['post_content'] = preg_replace("/<img[^>]+\>/i", "", $the_post['post_content']);

//         }

//     $html .= '</div>';

//     $html .= '<div class="netsposts-text-content">';

//         include POST_VIEWS_PATH . '/header.php';



//         if(!$shortcode_mgr->get_boolean('titles_only')) {

//             include POST_VIEWS_PATH . '/content.php';

//             if (isset($the_post['price']))

//                 include POST_VIEWS_PATH . '/commerce.php';

//         }

//     $html .= '</div>';

// $html .= '</div>';