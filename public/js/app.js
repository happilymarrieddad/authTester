// Communication
$(function() {
	
	var queue = {}
	var debug = true

	function log() {
		if (!debug) return
		if (console && console.log) console.log(arguments)
	}

	function notify(event, data) {
		data = data || null
		if (!queue.hasOwnProperty(event)) return log(event, 'nothing listening')
		$.each(queue[event], function (i, obj) {
			var ret = obj(data) || null
			if (event != 'bind' && event != 'start' && event != 'package-finished' && event != 'binding-finished') log(event, 'with', data, '=> ' + ret)
		})
		return true
	}

	function observe(event, obj) {
		if (typeof event == 'object') {
			$.each(event, function(i, ev) {
				observe(ev, obj)
			});
		} else if (typeof event == 'string') {
			if (!queue.hasOwnProperty(event)) queue[event] = []
			queue[event].push(obj)
		} else {
			log('Queue Reject', event)
		}
	}

	window.notify = notify
	window.observe = observe
	window.debug = debug

	if (debug) window.queue = queue

})
var router;
// Routing/Server
$(function() {

	// Router
	var started = false;
	var logged_in = false;

	var home = function() {
		$('section').hide()
		notify("start-loading")
		if (started) {
			if (logged_in) {
				notify("build-home")
			} else {
				location.href = '#/login'
				notify("build-login");
			}
		} else {
			//
		}
	}
	var about = function() {
		$('section').hide()
		notify("start-loading")
		if (started) {
			if (logged_in) {
				notify("build-about")
			} else {
				location.href = '#/login'
				notify("build-login");
			}
		} else {
			//
		}
	}
	var login = function() {
		$('section').hide()
		notify("start-loading")
		if (started) {
			if (logged_in) {
				location.href = '#/home'
				notify("build-home");
			} else {
				notify("build-login");
			}
		} else {
			//
		}
	}
	var unknown = function(route) {
		$('section').hide()
		notify("start-loading")
		if (started) {
			if (logged_in) {
				location.href = '#/home'
				notify("build-home")
			} else {
				location.href = '#/login'
				notify("build-login");
			}
		} else {
			//
		}
	}

	router = Router({
		'/home' : home,
		'/about' : about,
		'/login' : login,
		'/:unknown' : unknown
	})

	router.init()

	observe("start-loading", function() {
		$('section').hide();
		$("#whole-page").hide();
		$("#loading-page").show();
	});

	observe("finish-loading", function() {
		$("#loading-page").hide();
		$("#whole-page").show();
	});


	// Server
	var socket

	observe('connect-to-server',function() {
		socket = socketCluster.connect()

		socket.on('connect',function (status) {
			started = true
			if (status.isAuthenticated) {
				$('#login-errors-message').hide().text('')
				var hash = window.location.hash.slice(2)
				logged_in = true
				$('nav').show()
				if (hash.length < 1) {
					notify('start-loading')
					location.href = '#/home'
					notify('build-home')
				} else {
					notify("build-"+hash)
				}
			} else {
				logged_in = false
				if (window.location.hash.slice(2) == 'login' || window.location.hash.slice(2) == '') {} 
				else { $('#login-errors-message').show().text('You must be logged in to access that area.') }
				$('nav').hide()
				location.href = '#/login'
				notify('build-login')
			}
		})

		socket.on('authenticate',function(status) {
			// console.log(status)
		})
	});

	$('#login-button').on('click',function() {
		socket.emit('login',{
			email:$('#email').val(),
			password:$('#password').val()
		},function(err) {
			if (err) {
				logged_in = false
				$('#login-errors-message').show().text(err)
			} else {
				logged_in = true
				$('nav').show()
				var hash = window.location.hash.slice(2)
				notify('start-loading')
				location.href = '#/home'
				notify('build-home')
			}
		})
	})

	$('.logout').on('click',function() {
		socket.emit('logout',{

		},function(err) {
			if (err) {

			} else {
				logged_in = false
				$('nav').hide()
				location.href = '#/login'
				notify('build-login');
			}
		})
	})

})

// Home
$(function() {
	observe('build-home',function() {
		$('nav').show()
		notify("finish-loading");
		$("section[data-route=\"home\"]").show();
	})
})

// About
$(function() {
	observe('build-about',function() {
		$('nav').show()
		notify("finish-loading");
		$("section[data-route=\"about\"]").show();
	})
})

// Login
$(function() {
	observe('build-login',function() {
		$('nav').hide()
		notify("finish-loading");
		$("section[data-route=\"login\"]").show();
	})
})

// Start the application
$(document).ready(function() {
	notify('connect-to-server');
})