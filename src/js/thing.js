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
var remainIdealWinners = null;
var leaveIdealWinners = null;

var PARTY_NAMES = {
	'lab': 'Labour',
	'snp': 'Scottish National',
	'ld': 'Liberal Democrats',
	'green': 'Green',
	'con': 'Conservative',
	'ukip': 'UKIP',
	'other': 'Other'
}

var INLINE_PARTY_NAMES = {
	'lab': 'Labour',
	'snp': 'the Scottish National Party',
	'ld': 'the Liberal Democrats',
	'green': 'the Green Party',
	'con': 'the Conservative Party',
	'ukip': 'the UK Independence Party',
	'other': 'Other'
}

var PARTY_COLORS = {
	'lab': '#CC0000',
	'snp': '#FFCC00',
	'ld': '#FF9900',
	'green': '#6AB023',
	'con': '#333399',
	'ukip': '#70147A',

	'dup': '#777',
	'pc': '#777',
	'sdlp': '#777',
	'sf': '#777',
	'uup': '#777',

	'other': '#777',
	'NA': '#E4E4E4'
}

var EXPLAINER_TEMPLATE = _.template('\
	Your constituency <strong>voted in the <%= party %> candidate</strong> \
	in the 2015 general \
	election and <strong>voted to <%= brexitVote %> the EU</strong> in the \
	2016 Brexit \
	referendum. If you would like to <%= position %> Theresa May’s Brexit, you \
	should <strong>tactically vote <%= tactical %></strong> in the 2017 \
	election. Because you are \
	<strong><%= seat %></strong>, <%= consequence %>.')

/**
 * Initialize the graphic.
 *
 * Fetch data, format data, cache HTML references, etc.
 */
function init() {
	request.csv('data/graphic.csv', function(error, data) {
		formatData(data);

		remainPracticalWinners = countPracticalWinners('remain.practical.case');
		leavePracticalWinners = countPracticalWinners('leave.practical.case');

		remainIdealWinners = countIdealWinners('remain.ideal.case');
		leaveIdealWinners = countIdealWinners('leave.ideal.case');

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

	var lookup = d3.select('#lookup');
	var result = lookup.select('.result');
	var vote = result.select('.result .vote');
	var explainer = result.select('.result .explainer');

	var stance = stanceSelect.property('value');
	var slug = constituencySelect.property('value');

	if (stance == '' || slug == '') {
		result.style('display', 'none')

		return;
	}

	var d = graphicData[slug];

	var templateArgs = {
		'party': PARTY_NAMES[d['winner.party']],
		'brexitVote': d['leave.16'] > 50 ? 'leave' : 'remain in'
	};

	if (d['party.status'] == 'Solid remain' || d['party.status'] == 'Solid leave') {
		templateArgs['seat'] = 'not in a swing seat';
		templateArgs['consequence'] = 'it is unlikely that your vote can do much to change the outcome of the new election';
	} else {
		templateArgs['seat'] = 'in a swing seat';
		templateArgs['consequence'] = 'your vote could make a difference to the outcome of the new election';
	}

	if (stance == 'leave') {
		templateArgs['position'] = 'support';

		var voteParty = d['leave.top.party']
		templateArgs['tactical'] = PARTY_NAMES[voteParty];
	} else {
		templateArgs['position'] = 'oppose';

		var voteParty = d['remain.top.party']
		templateArgs['tactical'] = PARTY_NAMES[voteParty];
	}

	vote.html('Vote ' + templateArgs['tactical'] + '!</span>');
	explainer.html(EXPLAINER_TEMPLATE(templateArgs));

	result.style('border', '5px solid ' + PARTY_COLORS[voteParty]);
	result.style('display', 'block');

	// Highlight constituency
	d3.selectAll('path')
		.attr('stroke-width', '1px')
		.attr('stroke', '#FFFFFF')

	var mapElements = d3.selectAll('path.' + d['slug'])
		.attr('stroke-width', '2px')
		.attr('stroke', '#000')
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

function countIdealWinners(series) {
	var result = {
		'lab': 0,
		'snp': 0,
		'ld': 0,
		'green': 0,
		'con': 0,
		'ukip': 0,
		'other': 0
	}

	_.each(graphicData, function(d) {
		var party = d[series];

		if (!_.has(result, party)) {
			party = 'other';
		}

		result[party] += 1;
	})

	formatted = [];

	_.each(result, function(v, k) {
		formatted.push({
			'label': k,
			'amt': v
		})
	});

	return _.reverse(_.sortBy(formatted, 'amt'));
}

function countPracticalWinners(series) {
	var result = {
		'lab': 0,
		'snp': 0,
		'ld': 0,
		'green': 0,
		'con': 0,
		'ukip': 0,
		'other': 0
	}

	_.each(graphicData, function(d) {
		var party = d[series];

		if (party == 'NA') {
			party = d['winner.party'];
		}

		if (!_.has(result, party)) {
			party = 'other';
		}

		result[party] += 1;
	})

	formatted = [];

	_.each(result, function(v, k) {
		formatted.push({
			'label': k,
			'amt': v
		})
	});

	return _.reverse(_.sortBy(formatted, 'amt'));
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
		to: '#remain-practical-case .graphic',
		display: 'remain.practical.case'
	});

	renderBarChart({
		container: '#remain-practical-case .bars',
		width: isMobile ? width : width / 2,
		data: remainPracticalWinners
	})

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#leave-practical-case .graphic',
		display: 'leave.practical.case'
	});

	renderBarChart({
		container: '#leave-practical-case .bars',
		width: isMobile ? width : width / 2,
		data: leavePracticalWinners
	})

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#remain-ideal-case .graphic',
		display: 'remain.ideal.case'
	});

	renderBarChart({
		container: '#remain-ideal-case .bars',
		width: isMobile ? width : width / 2,
		data: remainIdealWinners
	})

	copyAndStyleGraphic({
		from:'#secret-render .graphic',
		to: '#leave-ideal-case .graphic',
		display: 'leave.ideal.case'
	});

	renderBarChart({
		container: '#leave-ideal-case .bars',
		width: isMobile ? width : width / 2,
		data: leaveIdealWinners
	})

	// Inform parent frame of new height
	fm.resize()
}

/*
 * Render the graphic.
 */
function renderGraphic(config) {
	// Configuration
	var aspectRatio = 4 / 5;

	var margins = {
		top: 0,
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
				return PARTY_COLORS[row[config['display']]];
			}

			return 'black';
		})
}

/*
 * Render a bar chart.
 */
var renderBarChart = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'label';
    var valueColumn = 'amt';

    var barHeight = 18;
    var barGap = 9;
    var labelWidth = 165;
    var labelMargin = 6;
    var valueGap = 6;

    var margins = {
        top: 0,
        right: 45,
        bottom: 30,
        left: (labelWidth + labelMargin)
    };

    var ticksX = 4;
    var roundTicksFactor = 5;

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = ((barHeight + barGap) * config['data'].length);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    /*
     * Create D3 scale objects.
     */
    var min = d3.min(config['data'], function(d) {
        return Math.floor(d[valueColumn] / roundTicksFactor) * roundTicksFactor;
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return Math.ceil(d[valueColumn] / roundTicksFactor) * roundTicksFactor;
    })

    var xScale = d3.scale.linear()
        .domain([min, max])
        .range([0, chartWidth]);

    /*
     * Render bars to chart.
     */
    chartElement.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
        .data(config['data'])
        .enter()
        .append('rect')
            .attr('x', function(d) {
                if (d[valueColumn] >= 0) {
                    return xScale(0);
                }

                return xScale(d[valueColumn]);
            })
            .attr('width', function(d) {
                return Math.abs(xScale(0) - xScale(d[valueColumn]));
            })
            .attr('y', function(d, i) {
                return i * (barHeight + barGap);
            })
            .attr('height', barHeight)
            .attr('class', function(d, i) {
                return 'bar-' + i + ' ' + utils.classify(d[labelColumn]);
            })
			.attr('fill', function(d) {
				return PARTY_COLORS[d['label']];
			})

    /*
     * Render bar labels.
     */
    chartWrapper.append('ul')
        .attr('class', 'labels')
        .attr('style', utils.formatStyle({
            'width': labelWidth + 'px',
            'top': (margins['top'] - 7) + 'px',
            'left': '0'
        }))
        .selectAll('li')
        .data(config['data'])
        .enter()
        .append('li')
            .attr('style', function(d, i) {
                return utils.formatStyle({
                    'width': labelWidth + 'px',
                    'height': barHeight + 'px',
                    'left': '0px',
                    'top': (i * (barHeight + barGap)) + 'px;'
                });
            })
            .attr('class', function(d) {
                return utils.classify(d[labelColumn]);
            })
            .append('span')
                .text(function(d) {
                    return PARTY_NAMES[d[labelColumn]];
                });

    /*
     * Render bar values.
     */
    chartElement.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(config['data'])
        .enter()
        .append('text')
            .text(function(d) {
                return d[valueColumn];
            })
            .attr('x', function(d) {
                return xScale(d[valueColumn]);
            })
            .attr('y', function(d, i) {
                return i * (barHeight + barGap);
            })
            .attr('dx', function(d) {
                return valueGap;
            })
            .attr('dy', (barHeight / 2) + 6)
}

// Bind on-load handler
$(document).ready(function() {
	init();
});
