(function() {
	var RELOAD_INTERVAL = 600000;//60000;
	var last_tab_view_at = new Date();
	var reload_interval_obj;
	
	chrome.extension.onMessage.addListener(
		function(request, sender, send_response) {
			if (request.scrumdo_loaded) {
				reload_page();
				
				set_reload_interval();
				
				send_response({ success: true });
			}
		}
	);
	
	chrome.extension.onMessage.addListener(
		function(request, sender, send_response) {
			if (request.scrumdo_unloaded) {
				clear_reload_interval();
				
				send_response({success: true});
			}
		}
	);
	
	// Set reload interval to user-defined interval
	chrome.extension.sendMessage({ get_option: 'refresh_interval' }, function(response) {
		if (response.refresh_interval) {
			clear_reload_interval();
			RELOAD_INTERVAL = response.refresh_interval * 1000;
			set_reload_interval();
		}
	});
	
	var set_reload_interval = function() {
		reload_interval_obj = window.setInterval(reload_page, RELOAD_INTERVAL);
	};
	
	var clear_reload_interval = function() {
		window.clearInterval(reload_interval_obj);
	};
	
	var reload_page = function() {
		now = new Date();
		
		if (now - last_tab_view_at > RELOAD_INTERVAL) {
			window.location.reload();
			
			last_tab_view_at = new Date();
		}
	};
	
	// Set initial reload interval
	reload_interval_obj = window.setInterval(reload_page, RELOAD_INTERVAL);
	
	
	// Conceptual Notes
	// If tab is focused, setInterval
	// If tab un-focuses, clearInterval();
	
	// When tab is selected, if it has been longer than a minute since the last 
	// reload, do a reload
})();


var StoryClass;
var Story;
$(function() {
	StoryClass = function() {
		// Current story
		this.el = '.scrum_board_story_block';
		this.$el = $('.scrum_board_story_block');
		this.column_el = '.scrum_board_column';
		this.$column_el = $('.scrum_board_column');
		this.total_columns = this.$column_el.length;
		this.project_panel_open = false;
		this.current = null;
	
		this.set_current = function($el) {
			this.unset_current();
			
			this.current = $el;
			this.current.addClass('active');
		};
	
		this.unset_current = function() {
			if (this.current) {
				this.current.removeClass('active');
				this.current = null;
			}
		};
		
		
		// Move to story
		this.move = function(opts) {
			if (this.current) {
				if (opts.direction === 'left') { this.move_left() }
				else if (opts.direction === 'right') { this.move_right() }
				else if (opts.direction === 'up') { this.move_up() }
				else if (opts.direction === 'down') { this.move_down() }
			}
			else {
				this.set_current(this.$el.first());
			}
		};
		
		this.move_left = function() {
			this.set_current(this.current_left_element());
		};
		
		this.move_right = function() {
			this.set_current(this.current_right_element());
		};
		
		this.move_up = function() {
			this.set_current(this.$el.eq(this.current_previous_element_index()));
		};
		
		this.move_down = function() {
			this.set_current(this.$el.eq(this.current_next_element_index()));
		};
		
		// Move - supporting methods
		// Vertical
		this.current_vertical_element_index = function(num) {
			return this.$el.index(this.current) + num;
		};
		
		this.current_next_element_index = function() {
			return this.current_vertical_element_index(1);
		};
		
		this.current_previous_element_index = function() {
			return this.current_vertical_element_index(-1);
		};
		
		// Horizontal
		this.current_left_element = function() {
			return this.previous_column().find(this.el).first();
		};
		
		this.current_right_element = function() {
			return this.next_column().find(this.el).first();
		};
		
		// Column methods
		this.current_column = function() {
			return this.current.parent().parent();
		};
		
		this.current_column_index = function() {
			console.log('CURRENTCOLUMNINDEX');
			console.log(this.current_column().index());
			return this.current_column().index();
		};
		
		this.column_has_stories = function(column_index) {
			var that = this;
			var query = function(index) {
				return (that.$column_el.eq(index).find(that.el).length > 0) ? true : false;
			};
			
			if (column_index) {
				return query(column_index);
			}
			else {
				return query(this.current_column_index());
			}
		};
		
		this.sibling_column = function(column_index, offset) {
			// Don't let people move outside the edge columns
			var new_column_index = column_index + offset;
			if (new_column_index >= this.total_columns
				|| new_column_index < 0) {
				return this.current_column();
			}
			
			return this.$column_el.eq(column_index + offset);
		};
		
		this.next_column = function() {
			return this.sibling_column(this.current_column_index(), 1);
		};
		
		this.previous_column = function() {
			return this.sibling_column(this.current_column_index(), -1);
		};
		
		
		// Edit story
		this.wait_for_edit_modal_to_load = function(func) {
			return setTimeout(func, 500);
		};
		
		this.open_edit_modal = function() {
			this.current.find('.storyIcons').children('a').eq(1).trigger('click');
		};
		
		this.close_edit_modal = function() {
			$('.overlay_close').trigger('click');
		};
		
		this.edit = function() {
			if (this.current) {
				this.open_edit_modal();
				this.wait_for_edit_modal_to_load(function() {
					$('textarea#id_summary').focus();
				});
			}
		};
		
		// Go to assignees
		this.assign = function() {
			if (this.current) {
				this.open_edit_modal();
				this.wait_for_edit_modal_to_load(function() {
					$('.tag_holder').eq(1).children('ul').children('.tagit-new').children('input').focus();
				});
			}
		};
		
		// Point story
		// Can't use left and right arrows to change points so doesn't work
		this.point = function() {
			if (this.current) {
				this.open_edit_modal();
				this.wait_for_edit_modal_to_load(function() {
					$('#points_section').find('input[name="points"]:checked').focus();
				});
			}
		};
		
		// Toggle tasks section
		this.tasks = function() {
			if (this.current) {
				this.current.find('.show_tasks_link').trigger('click');
				
				// Focus task summary field
				that = this;
				setTimeout(function() {
					that.current.find('.tasks_area input[name="summary"]').focus();
				}, 500);
			}
		};
		
		
		// Open project drop-down
		this.enable_project_panel_tabbing = function() {
			$('.project-menu-iteration-list-item').attr('tabindex', '0');
			$('.project-menu-iteration-list-item').eq(1).focus()
			
			// Enter redirects that iteration
			$('.project-menu-iteration-list-item').on('keydown', function(e) {
				var key = (e.which || e.keyCode);
				
				if (key === KeyCodes.enter) {
					window.location.href = $(this).children('a').attr('href');
				}
			});
		};
		
		this.disable_project_panel_tabbing = function() {
			$('.project-menu-iteration-list-item').removeAttr('tabindex');
			
			$('.project-menu-iteration-list-item').off('keydown')
		};
		
		this.toggle_project_panel = function() {
			if (!this.project_panel_open) {
				$('.project-dropdown-menu').parent().trigger('click');
				this.project_panel_open = true;
				
				this.enable_project_panel_tabbing();
			}
			else {
				this.disable_project_panel_tabbing();
				$('body').trigger('click')
				this.project_panel_open = false;
			}
		};
		
		
		return this;
	};
	
	Story = new StoryClass();
});


var KeyCodes = {
	arrows: {
		left: 37,
		right: 39,
		up: 38,
		down: 40
	},
	numbers: {
		0: 48,
		1: 49,
		2: 50,
		3: 51,
		4: 52,
		5: 53,
		6: 54,
		7: 55,
		8: 56,
		9: 57
	},
	a: 65,
	b: 66,
	i: 73,
	l: 76,
	p: 80,
	t: 84,
	enter: 13,
	esc: 27
};


// Set the current story
$(function() {
	var $story_el = $('.scrum_board_story_block');
	
	// Mouseover
	$story_el.on('mouseenter', function() {
		Story.set_current($(this));
	})
	.on('mouseleave', function() {
		Story.unset_current();
	});
	
	
	// Arrow keys
	$(document).on('keydown', function(e) {
		var key = (e.which || e.keyCode);
		
		// Collect arrow key codes into an array
		var arrow_keycodes = [];
		for (var k in KeyCodes.arrows) {
			arrow_keycodes.push(KeyCodes.arrows[k])
		}
		// Prevent key behavior of arrow keys
		if (arrow_keycodes.indexOf(key) !== -1) {
			e.preventDefault();
		}
		
		switch (key) {
			case KeyCodes.arrows.left:
				Story.move({ direction: 'left'});
				break;
			case KeyCodes.arrows.right:
				Story.move({ direction: 'right' });
				break;
			case KeyCodes.arrows.up:
				Story.move({ direction: 'up' });
				break;
			case KeyCodes.arrows.down:
				Story.move({ direction: 'down' });
				break;
		}
	});
});


// Story actions - keyboard shortcuts
$(function() {
	// Disable keyboard shortcuts when an input element is focused
	$('input[type="text"], textarea').on('focus', function() {
		// Disable
		disable_keyboard_shortcuts();
	}).on('blur', function() {
		// Enable
		enable_keyboard_shortcuts();
	});
	
	var bind_keyboard_commands = function(e) {
		var key = (e.which || e.keyCode);
	
		// console.log(e);
	
		var responds_to = [];
		// for (var k in KeyCodes){}
	
		switch (key) {
			case KeyCodes.i:
				Story.edit();
				break;
			case KeyCodes.a:
				Story.assign();
				break;
			case KeyCodes.p:
				Story.point();
				break;
			case KeyCodes.t:
				Story.tasks();
				break;
			case KeyCodes.b:
				Story.toggle_project_panel();
				break;
			case KeyCodes.esc:
				Story.close_edit_modal();
				break;
			case KeyCodes.l:
				if (e.shiftKey) {
					Story.list_view();
				}
				break;
		}
	};
	
	var disable_keyboard_shortcuts = function() {
		console.log('DISABLED');
		$(document).off('keydown', bind_keyboard_commands);
	};
	
	var enable_keyboard_shortcuts = function() {
		console.log('ENABLED');
		$(document).on('keydown', bind_keyboard_commands);
	};
	enable_keyboard_shortcuts();
});
