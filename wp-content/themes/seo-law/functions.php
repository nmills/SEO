<?php 

/**
* Our custom post type function
*/
function create_Legal_document_posttype() {
 
    register_post_type( 'legal_documents',
        array(
            'labels' => array(
                'name' => __( 'Legal Documents' ),
                'singular_name' => __( 'Legal Document' )
            ),
            'public' => true,
            'has_archive' => true,
            'rewrite' => array('slug' => 'legal_documents'),
        )
    );

     register_taxonomy(
       'nationality',
       array('legal_documents',),
       array(
         'label' => __( 'Nationality' ),
         'rewrite' => array(
           'slug' => 'nationality',
           'with_front' => false
         ),
         'hierarchical' => true
       )
     );
}
// Hooking up our function to theme setup
add_action( 'init', 'create_Legal_document_posttype' );

?>