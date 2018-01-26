<?php 

/**
* Our custom post type function
*/
function create_career_posttype() {
 
    register_post_type( 'carrer',
        array(
            'labels' => array(
                'name' => __( 'Careers' ),
                'singular_name' => __( 'Career' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'career'),
        )
    );

    register_taxonomy(
       'career_path',
       array('carrer',),
       array(
         'label' => __( 'Career Path' ),
         'rewrite' => array(
           'slug' => 'career_path',
           'with_front' => false
         ),
         'hierarchical' => true
       )
     );
}
// Hooking up our function to theme setup
add_action( 'init', 'create_career_posttype' );

?>