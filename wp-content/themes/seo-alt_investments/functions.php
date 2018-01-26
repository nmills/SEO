<?php 

/**
* Our custom post type function
*/
function create_investment_posttype() {
 
    register_post_type( 'investment',
        array(
            'labels' => array(
                'name' => __( 'Investments' ),
                'singular_name' => __( 'Investment' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'investment'),
        )
    );

    register_taxonomy(
       'bank',
       array('investment',),
       array(
         'label' => __( 'Bank' ),
         'rewrite' => array(
           'slug' => 'bank',
           'with_front' => false
         ),
         'hierarchical' => true
       )
     );
}
// Hooking up our function to theme setup
add_action( 'init', 'create_investment_posttype' );

?>