// NPM modules
var d3 = require('d3');
var request = require('d3-request');

// Local modules
var features = require('./detectFeatures')();
var fm = require('./fm');
var utils = require('./utils');

// Globals
var DEFAULT_WIDTH = 940;
var MOBILE_BREAKPOINT = 600;

var graphicData = null;
var isMobile = false;

var PARTY_NAMES = {
	'lab': 'Labour',
	'snp': 'the Scottish National Party',
	'ld': 'the Liberal Democrats',
	'green': 'the Green Party',
	'con': 'the Conservative Party',
	'ukip': 'UKIP'
}

var VOTE_COLORS = {
	'lab': '#CC0000',
	'snp': '#FFCC00',
	'ld': '#FF9900',
	'green': '#6AB023',
	'con': '#333399',
	'ukip': '#70147A'
}

/**
 * Initialize the graphic.
 *
 * Fetch data, format data, cache HTML references, etc.
 */
function init() {
	request.csv('data/graphic.csv', function(error, data) {
		formatData(data);
		populateSelect(data);

		render();
		$(window).resize(utils.throttle(onResize, 250));
	});
}

function populateSelect(data) {
	var select = d3.select('#constituency');

	select.selectAll('option')
		.data(data)
		.enter()
			.append('option')
			.attr('value', function(d) { return d['name'] })
			.text(function(d) { return d['name'] });

	select.insert('option', ':first-child')
		.attr('value', '')
		.text('');

	select.property('value', '');

	select.on("change", onSelectChange);
}

var onSelectChange = function(d) {
	var brexitResult = d3.select('.brexit-result');
	var remainResult = d3.select('#remain .result');
	var leaveResult = d3.select('#leave .result');

	var name = d3.select(this).property('value');

	if (name == '') {
		brexitResult.text('');
		remainResult.text('');
		leaveResult.text('');

		return;
	}

	var data = graphicData[name.toLowerCase().replace('&', 'and')];

	var brexitVote = parseFloat(data['leave.16']).toFixed(1);

	var remainVote = PARTY_NAMES[data['tactical.remain.vote']];
	var leaveVote = PARTY_NAMES[data['tactical.leave.vote']];

	var remainPct = parseFloat(data[data['tactical.remain.vote'] + '.15']).toFixed(1);
	var leavePct = parseFloat(data[data['tactical.leave.vote'] + '.15']).toFixed(1);

	var totalRemainPct = (parseFloat(data['lab.15']) +
		parseFloat(data['snp.15']) +
		parseFloat(data['ld.15'])).toFixed(1);

	var totalLeavePct = (parseFloat(data['con.15']) +
		parseFloat(data['ukip.15'])).toFixed(1);

	brexitResult.text('In 2016, approximately ' + brexitVote + '% of ' + name + ' voters voted to leave the EU. (TKTK)');
	remainResult.text('You should vote for ' + remainVote + '. They received ' + remainPct + '% of the vote in ' + name + ' in 2015. If votes from all remain-supporting parties were consolidated they would receive ' + totalRemainPct + '%.');
	leaveResult.text('You should vote for ' + leaveVote + '. They receieved ' + leavePct + '% of the vote in ' + name + ' in 2015. If votes from all leave-supporting parties were consolidated they would receive ' + totalLeavePct + '%.');
}

/**
 * Format data or generate any derived variables.
 */
function formatData(data) {
	graphicData = {};

	data.forEach(function(d) {
		var name = d['name'].toLowerCase().replace('&', 'and');

		// Handle name mismatches w/ JS library
		if (name == 'south ribble') {
			name = 'ribble south';
		} else if (name == 'dunfermline and fife west') {
			name = 'dunfermline and west fife';
		} else if (name == 'ochil and perthshire south') {
			name = 'ochil and south perthshire';
		} else if (name == 'perth and perthshire north') {
			name = 'perth and north perthshire';
		}

		graphicData[name] = d;
	});
}

/**
 * Invoke on resize. By default simply rerenders the graphic.
 */
function onResize() {
	render();
}

/**
 * Figure out the current frame size and render the graphic.
 */
function render() {
	var width = $('#interactive-content').width();

	if (width <= MOBILE_BREAKPOINT) {
		isMobile = true;
	} else {
		isMobile = false;
	}

	renderGraphic({
		container: '#remain-best-case .graphic',
		width: isMobile ? width : width / 2,
		display: 'remain.best.case'
	});

	renderGraphic({
		container: '#leave-best-case .graphic',
		width: isMobile ? width : width / 2,
		display: 'leave.best.case'
	});

	// Inform parent frame of new height
	fm.resize()
}

/*
 * Render the graphic.
 */
function renderGraphic(config) {
	// Configuration
	var aspectRatio = isMobile ? 4 / 5 : 6 / 7;

	var margins = {
		top: 10,
		right: 20,
		bottom: 50,
		left: 30
	};

	// Calculate actual chart dimensions
	var width = config['width'];
	var height = width / aspectRatio;

	var chartWidth = width - (margins['left'] + margins['right']);
	var chartHeight = height - (margins['top'] + margins['bottom']);

	// Clear existing graphic (for redraw)
	var containerElement = d3.select(config['container']);
	containerElement.html('');

	// Create the root SVG element
	var chartWrapper = containerElement.append('div')
		.attr('class', 'graphic-wrapper');

	var chartElement = chartWrapper.append('svg')
		.attr('width', chartWidth + margins['left'] + margins['right'])
		.attr('height', chartHeight + margins['top'] + margins['bottom'])
		.append('g')
		.attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

	var map = UK.ElectionMap()
		.edgeLength(14 * (width / 960))
		.origin({ x: chartWidth / 6, y: chartHeight })
		.cls(function(name) {
			var row = graphicData[name.toLowerCase()];

			return 'constituency ' + utils.classify(row['id']);
			return 'constituency foo';
		})
		.fill(function (name) {
			var row = graphicData[name.toLowerCase()];

			if (row) {
				return VOTE_COLORS[row[config['display']]];
			}

			return 'black';
		})

	map(chartElement);
}

// Bind on-load handler
$(document).ready(function() {
	init();
});
