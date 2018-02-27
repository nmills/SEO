(function() {
	var button_name = 'simple_tooltips'; //set button name
	
	tinymce.create('tinymce.plugins.'+button_name, {
		init : function(ed, url) {
			ed.addButton(button_name, {
				title : 'Add Youtube Embed', //set button label
				image : url+'/icon.png', //set icon filename (20 X 20px). put icon in same folder
				onclick : function() {
					ed.execCommand('mceInsertContent', false, '[youtube link="Enter the link here"]');
				}
			});
		},
		// createControl : function(n, cm) {
		// 	return null;
		// },
		// getInfo : function() {
		// 	return {
		// 		longname : button_name,
		// 		author : 'Justin Saad',
		// 		authorurl : 'http://clevelandwebdeveloper.com/',
		// 		infourl : 'http://clevelandwebdeveloper.com/',
		// 		version : "1.0"
		// 	};
		// }
	});
	tinymce.PluginManager.add(button_name, tinymce.plugins[button_name]);
})();