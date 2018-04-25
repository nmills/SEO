<?php
/**
* Index template
*
* A fallback list template used if a more specific template is not available
*
*/

if ( ! class_exists( 'Timber' ) ) {
  echo 'Timber not activated. Make sure you activate the plugin in <a href="/wp-admin/plugins.php#timber">/wp-admin/plugins.php</a>';
  return;
}
$context = Timber::get_context();
$context['search_phrase'] = get_search_query();
$context['posts'] = new Timber\PostQuery();
$templates = array( 'search.twig' );

$sites_array = array();
$all_sites = get_sites();
foreach ($all_sites as $site) {
	$new_site = array();
	$new_site['link'] = '//'.$site->domain.$site->path;
	$new_site['id'] = $site->id;
	switch_to_blog($site->id);
	$new_site['name'] = get_bloginfo('name');
	restore_current_blog();
	array_push($sites_array, $new_site);
}

$context['search_filters'] = $sites_array;

Timber::render( $templates, $context );