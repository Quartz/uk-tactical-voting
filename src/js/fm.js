var PARENT_DOMAIN = "qz.com";
//var PARENT_DOMAIN = "qz.dev";
//var PARENT_DOMAIN = "quartz.ly";
var $interactive = $("#interactive-content");
var FM = null;
var propCallback;

/**
 * Setup Frame Messenger and connect to parent.
 */
function setupFrameMessenger() {
	// Production: use frame messenging (will error if no parent frame)
	local_prod_test = window.location.search.toString().indexOf("e=1") > -1
	if (ENV == 'prod' || local_prod_test) {
		if(local_prod_test) {
			PARENT_DOMAIN = "localhost:3000"
		}
		FM = frameMessager({
			allowFullWindow : false,
			parentDomain : PARENT_DOMAIN
		});

		FM.onMessage("app:activePost", resize);

		$("body").css("overflow", "hidden");
	// Test environment: no frame messenging
	} else {
		$("body").css("border", "#ff8080");
	}
}

/**
 * Compute the height of the interactive.
 */
function documentHeight () {
	var body = document.body;
	var html = document.documentElement;
	var height =	Math.max( body.scrollHeight, body.offsetHeight,
						 html.clientHeight, html.scrollHeight, html.offsetHeight );

	return height;
}

/**
 * Update parent height.
 */
function updateHeight (height) {
	if (!FM) {
		return;
	}

	height = height || documentHeight();

	FM.triggerMessage("QZParent", "child:updateHeight", {
		height : height
	});

	return;
}

/**
 * Update parent hash.
 */
function updateHash (hash) {
	if (!FM) {
		window.location.hash = hash;
	} else {
		FM.triggerMessage("QZParent", "child:updateHash", {
			hash : hash
		});
	}
	return;
}

/**
 * Read parent hash.
 */
function getWindowProps () {
	if (!FM) {
		return propCallback({
			action: "parent:readWindowProps", 
			fromId: "QZParent", 
			toId: "interactive-local", 
			data: {
				windowProps: {
					clientDimensions: {
						width: null,
						height: null,
					},
					pageOffset: {
						x: null,
						y: null
					},
					uri: {
						hash: window.location.hash,
						href: window.location.href,
						origin: window.location.origin,
						pathname: window.location.pathname
					}
				}
			}
		});
	}

	FM.triggerMessage("QZParent", "child:getWindowProps");

	return;
}

/**
 * Set up a callback that will handle incoming hash data
 */
function setupReadWindow(callback) {
	if (!FM) {
		propCallback = callback;
	} else {
		FM.onMessage("parent:readWindowProps", callback);
	}
}

/**
 * Resize the parent to match the new child height.
 */
function resize () {
	var height = $interactive.outerHeight(true);

	updateHeight(height);
}

/**
 * Scroll the parent window to a given location.
 *
 * Call like this:
 * fm.scrollToPosition($("#scrollToThisDiv").offset().top,500)
 *
 * Where 500 is the duration of the scroll animation
 */
function scrollToPosition (position,duration) {


	if (!FM) {
		$("html,body").animate({
			scrollTop: position
		}, duration);
	} else {
		FM.triggerMessage("QZParent", "child:scrollToPosition", {
			position : position,
			duration : 500
		});
	}
}

/**
 * Get a reference to the parent window.
 */
function getParentWindow () {
	return FM.triggerMessage("QZParent", "child:getWindow");
}

setupFrameMessenger();

module.exports = {
	resize: resize,
	scrollToPosition: scrollToPosition,
	getParentWindow: getParentWindow,
	updateHash: updateHash,
	getWindowProps: getWindowProps,
	setupReadWindow: setupReadWindow
};