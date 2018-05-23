<?php 

/**
* Our custom post type function
*/
function create_scholar_posttype() {
 
    register_post_type( 'scholars',
        array(
            'labels' => array(
                'name' => __( 'Scholars' ),
                'singular_name' => __( 'Scholar' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'scholars'),
        )
    );

     register_taxonomy(
       'university',
       array('scholars',),
       array(
         'label' => __( 'University' ),
         'rewrite' => array(
           'slug' => 'university',
           'with_front' => false
         ),
         'hierarchical' => true
       )
     );
}
// Hooking up our function to theme setup
// add_action( 'init', 'create_scholar_posttype' );

?>