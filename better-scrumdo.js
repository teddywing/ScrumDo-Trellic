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
$(function() {
	StoryClass = function() {
		// Current story
		this.el = '.scrum_board_story_block';
		this.$el = $('.scrum_board_story_block');
		this.column_el = '.scrum_board_column';
		this.$column_el = $('.scrum_board_column');
		this.total_columns = this.$column_el.length;
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
			return this.current.parent().parent().prev(this.column_el).find(this.el).first();
		};
		
		this.current_right_element = function() {
			// return this.current.parent().parent().next(this.column_el).find(this.el).first();
			return this.next_column_with_stories().find(this.el).first();
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
			var that = this;
			var wraparound = function(index) {
				if (index < 0) { return that.total_columns - 1; }
				else if (index >= that.total_columns) { return 0; }
				else { return index; }
			};
			
			return this.$column_el.eq(wraparound(column_index + offset));
		};
		
		this.next_column = function() {
			return this.sibling_column(this.current_column_index(), 1);
		};
		
		this.previous_column = function() {
			return this.sibling_column(this.current_column_index(), -1);
		};
		
		this.next_column_with_stories = function() {
			var column = this.$column_el.eq(this.current_column_index() + 1);
			console.log('THE NEXT THREE LINES OF COLUMNS');
			console.log(this.next_column());
			console.log(this.sibling_column(this.current_column_index(), 2));
			console.log(this.sibling_column(this.current_column_index(), 3));
			// console.log(this.current_column_index());
			// console.log(column.index());
			// while (!this.column_has_stories(column.index())) {
			// 	console.log(this.column_has_stories(column.index()));
			// 	column = this.next_column();
			// }
			
			// do {
			// 	console.log(this.column_has_stories(column.index()));
			// 	column = this.next_column();
			// } while (!this.column_has_stories(column.index()));
			
			return column;
		};
		
		this.previous_column_with_stories = function() {
			
		};
		
		
		return this;
	};
});


var KeyCodes = {
	arrows: {
		left: 37,
		right: 39,
		up: 38,
		down: 40
	}
};


// Set the current story
$(function() {
	var $story_el = $('.scrum_board_story_block');
	var Story = new StoryClass();
	
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
