// NPM modules
var d3 = require('d3');
var request = require('d3-request');
var _ = require('lodash');

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
	'ukip': 'the UK Independence Party'
}

var VOTE_COLORS = {
	'lab': '#CC0000',
	'snp': '#FFCC00',
	'ld': '#FF9900',
	'green': '#6AB023',
	'con': '#333399',
	'ukip': '#70147A',
	'NA': '#E4E4E4'
}

var TEMPLATE = _.template('In 2015, <%= total %>% of <%= constituency %> voters chose a party that supported <%= position %> the EU. In 2016, approximately <%= brexitVote %>% voted to leave the EU. If you wish to vote tactically, the data suggest you should cast a ballot for <%= tactical %>. <%= constituency %> is highlighted in black on the maps in throughout this story.');

/**
 * Initialize the graphic.
 *
 * Fetch data, format data, cache HTML references, etc.
 */
function init() {
	request.csv('data/graphic.csv', function(error, data) {
		formatData(data);
		populateSelects(data);

		render();
		$(window).resize(utils.throttle(onResize, 250));
	});
}

function populateSelects(data) {
	var stanceSelect = d3.select('#stance');
	var constituencySelect = d3.select('#constituency');

	constituencySelect.selectAll('option')
		.data(data)
		.enter()
			.append('option')
			.attr('value', function(d) { return d['slug']; })
			.text(function(d) { return d['name'] });

	constituencySelect.insert('option', ':first-child')
		.attr('value', '')
		.text('');

	constituencySelect.property('value', '');

	stanceSelect.on('change', onSelectChange);
	constituencySelect.on('change', onSelectChange);
}

var onSelectChange = function(d) {
	var stanceSelect = d3.select('#stance');
	var constituencySelect = d3.select('#constituency');
	var brexitResult = d3.select('#brexit-result');

	var stance = stanceSelect.property('value');
	var slug = constituencySelect.property('value');

	if (stance == '' || slug == '') {
		brexitResult.text('');

		return;
	}

	var d = graphicData[slug];

	var templateArgs = {
		'constituency': d['name'],
		'brexitVote': parseFloat(d['leave.16']).toFixed(1),
	};

	if (stance == 'leave') {
		templateArgs['position'] = 'leaving';
		templateArgs['total'] = parseFloat(d['right.total.15']).toFixed(1);
		templateArgs['tactical'] = PARTY_NAMES[d['tactical.leave.vote']];
	} else {
		templateArgs['position'] = 'remaining in';
		templateArgs['total'] = parseFloat(d['left.total.15']).toFixed(1);
		templateArgs['tactical'] = PARTY_NAMES[d['tactical.remain.vote']];
	}

	brexitResult.text(TEMPLATE(templateArgs));

	d3.selectAll('path')
		.attr('stroke', '#FFFFFF')

	var mapElements = d3.selectAll('path.' + d['slug'])
		.attr('stroke', '#000000')
		.moveToFront();
}

d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

/**
 * Format data or generate any derived variables.
 */
function formatData(data) {
	graphicData = {};

	data.forEach(function(d) {
		d['slug'] = utils.classify(d['name'].replace('&', 'and'));

		// Handle name mismatches w/ JS library
		if (d['slug'] == 'south-ribble') {
			d['slug'] = 'ribble-south';
		} else if (d['slug'] == 'dunfermline-and-fife-west') {
			d['slug'] = 'dunfermline-and-west-fife';
		} else if (d['slug'] == 'ochil-and-perthshire-south') {
			d['slug'] = 'ochil-and-south-perthshire';
		} else if (d['slug'] == 'perth-and-perthshire-north') {
			d['slug'] = 'perth-and-north-perthshire';
		}

		graphicData[d['slug']] = d;
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
		container: '#secret-render .graphic',
		width: isMobile ? width : width / 2
	});

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#remain-best-case .graphic',
		display: 'remain.best.case'
	});

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#leave-best-case .graphic',
		display: 'leave.best.case'
	});

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#remain-realistic-case .graphic',
		display: 'remain.practical.case'
	});

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#leave-realistic-case .graphic',
		display: 'leave.practical.case'
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
		.class(function(name) {
			return utils.classify(name);
		})

	map(chartElement);
}

function copyAndStyleGraphic(config) {
	var from = d3.select(config['from']);
	var to = d3.select(config['to']);

	to.html(from.html());

	d3.selectAll(config['to'] + ' path')
		.attr('fill', function(d) {
			var name = d3.select(this).attr('class');

			var row = graphicData[name];

			if (row) {
				return VOTE_COLORS[row[config['display']]];
			}

			return 'black';
		})
}

// Bind on-load handler
$(document).ready(function() {
	init();
});
