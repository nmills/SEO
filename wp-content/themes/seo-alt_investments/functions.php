<?php 
/* Removing global homepage template on child themes */
add_filter( 'theme_page_templates', 'seo_remove_page_template' );
  function seo_remove_page_template( $pages_templates ) {
    unset( $pages_templates['template-global_homepage.php'] );
    return $pages_templates;
  }
?>