if (typeof UK === 'undefined') {
  var UK = {};
}

UK.ElectionMap = function () {
  var edgeLength = 30,
      stroke = '#FFFFFF';
      fill = 'none';
      origin = undefined;
      angle = (60 * (Math.PI / 180.0));

  function closedPath(point, points) {
    var tmp = [];

    tmp.push('M' + point[0] + ' ' + point[1]);

    for (var i = 0; point = points[i]; i++) {
      tmp.push('L' + point[0] + ' ' + point[1]);
    }

    tmp.push('z');

    return tmp.join('');
  }

  function chart(svg) {
    var sinEdgeLength = Math.sin(angle) * edgeLength;

    var cosEdgeLength = Math.cos(angle) * edgeLength;

    if (typeof origin === 'undefined') {
      origin = {x: (4 * edgeLength) + Math.ceil(5 * cosEdgeLength), y: svg.attr('height') - Math.ceil(2 * sinEdgeLength)};
    }

    function path(d) {
      var x = origin.x + (d[0] * (edgeLength + cosEdgeLength)), y = origin.y - (d[1] * sinEdgeLength);

      var x1 = x + edgeLength, y1 = y + sinEdgeLength, y2 = y1 + sinEdgeLength;

      return closedPath([x, y], [[x1, y], [x1 + cosEdgeLength, y1], [x1, y2], [x, y2], [x - cosEdgeLength, y1]]);
    }

    var tiles = svg.selectAll('.constituency').data(UK.ElectionMap.CONSTITUENCIES).enter()
      .append('path')
        .attr('class', 'constituency')
        .attr('stroke', stroke)
        .attr('fill', fill)
        .attr('d', path);

    return tiles;
  }

  chart.edgeLength = function (_) {
    if (!arguments.length) return edgeLength;
    edgeLength = _;
    return chart;
  };

  chart.origin = function (_) {
    if (!arguments.length) return origin;
    origin = _;
    return chart;
  };

  chart.stroke = function (_) {
    if (!arguments.length) return stroke;
    stroke = _;
    return chart;
  };

  chart.fill = function (_) {
    fill = function (d) { return _(d[2]); };
    return chart;
  };

  return chart;
}

UK.ElectionMap.CONSTITUENCIES = [
  [0, 0, "St Ives"]
, [1, 1, "Camborne and Redruth"]
, [2, 0, "Truro and Falmouth"]
, [2, 2, "St Austell and Newquay"]
, [3, 1, "Cornwall South East"]
, [3, 3, "Cornwall North"]
, [4, 2, "Plymouth Sutton and Devonport"]
, [4, 4, "Devon West and Torridge"]
, [5, 1, "Devon South West"]
, [5, 3, "Plymouth Moor View"]
, [6, 4, "Exeter"]
, [5, 5, "Devon Central"]
, [6, 2, "Torbay"]
, [6, 0, "Totnes"]
, [7, 3, "Newton Abbot"]
, [7, 5, "Devon East"]
, [5, 7, "Devon North"]
, [6, 6, "Taunton Deane"]
, [6, 8, "Bridgwater and Somerset West"]
, [7, 7, "Yeovil"]
, [7, 9, "Wells"]
, [8, 8, "Somerton and Frome"]
, [8, 6, "Tiverton and Honiton"]
, [9, 5, "Dorset West"]
, [10, 4, "Dorset South"]
, [10, 6, "Poole"]
, [9, 7, "Dorset Mid and Poole North"]
, [8, 10, "Weston-Super-Mare"]
, [9, 9, "Wiltshire South West"]
, [10, 8, "Dorset North"]
, [11, 7, "Bournemouth East"]
, [12, 6, "Christchurch"]
, [13, 5, "New Forest West"]
, [15, 3, "Isle of Wight"]
, [14, 6, "Southampton Test"]
, [15, 7, "Southampton Itchen"]
, [16, 6, "Eastleigh"]
, [17, 5, "Fareham"]
, [18, 6, "Gosport"]
, [19, 7, "Portsmouth South"]
, [20, 8, "Havant"]
, [21, 7, "Chichester"]
, [22, 8, "Bognor Regis and Littlehampton"]
, [23, 7, "Worthing West"]
, [24, 8, "Worthing East and Shoreham"]
, [25, 7, "Hove"]
, [26, 8, "Brighton Kemptown"]
, [27, 9, "Lewes"]
, [28, 8, "Eastbourne"]
, [12, 8, "Salisbury"]
, [12, 10, "Devizes"]
, [12, 12, "Wiltshire North"]
, [12, 14, "Swindon South"]
, [12, 16, "Stroud"]
, [13, 17, "Swindon North"]
, [13, 21, "Cheltenham"]
, [12, 20, "Tewkesbury"]
, [11, 19, "Forest of Dean"]
, [11, 17, "Thornbury and Yate"]
, [11, 15, "Kingswood"]
, [10, 16, "Filton and Bradley Stoke"]
, [10, 14, "Bristol East"]
, [11, 13, "Bath"]
, [11, 11, "Chippenham"]
, [10, 12, "Bristol West"]
, [9, 13, "Bristol North West"]
, [8, 12, "Somerset North"]
, [9, 11, "Bristol South"]
, [10, 10, "Somerset North East"]
, [11, 9, "Bournemouth West"]
, [12, 18, "Gloucester"]
, [13, 19, "Cotswolds, The"]
, [10, 18, "Newport West"]
, [10, 20, "Cardiff North"]
, [11, 21, "Newport East"]
, [11, 23, "Monmouth"]
, [11, 25, "Torfaen"]
, [10, 26, "Blaenau Gwent"]
, [10, 28, "Ceredigion"]
, [10, 30, "Brecon and Radnorshire"]
, [10, 32, "Montgomeryshire"]
, [10, 34, "Clwyd South"]
, [10, 36, "Wrexham"]
, [10, 38, "Alyn and Deeside"]
, [9, 39, "Delyn"]
, [9, 37, "Vale of Clwyd"]
, [9, 35, "Clwyd West"]
, [8, 36, "Aberconwy"]
, [9, 25, "Merthyr Tydfil and Rhymney"]
, [8, 24, "Rhondda"]
, [7, 23, "Neath"]
, [5, 21, "Llanelli"]
, [4, 22, "Preseli Pembrokeshire"]
, [4, 20, "Carmarthen West and Pembrokeshire South"]
, [5, 19, "Gower"]
, [6, 18, "Swansea East"]
, [7, 17, "Bridgend"]
, [8, 18, "Vale of Glamorgan"]
, [9, 19, "Cardiff South and Penarth"]
, [6, 20, "Swansea West"]
, [7, 19, "Ogmore"]
, [7, 21, "Aberavon"]
, [8, 20, "Cardiff West"]
, [9, 21, "Cardiff Central"]
, [8, 22, "Pontypridd"]
, [9, 23, "Cynon Valley"]
, [10, 24, "Islwyn"]
, [10, 22, "Caerphilly"]
, [6, 22, "Carmarthen East and Dinefwr"]
, [25, 9, "Brighton Pavilion"]
, [7, 35, "Arfon"]
, [8, 34, "Dwyfor Meirionnydd"]
, [6, 38, "Ynys Mon"]
, [14, 22, "Banbury"]
, [15, 23, "Henley"]
, [16, 24, "Milton Keynes North"]
, [16, 22, "Milton Keynes South"]
, [17, 21, "Buckingham"]
, [16, 20, "Beaconsfield"]
, [16, 18, "Slough"]
, [15, 17, "Oxford East"]
, [15, 19, "Wycombe"]
, [15, 21, "Chesham and Amersham"]
, [14, 20, "Witney"]
, [14, 18, "Aylesbury"]
, [14, 16, "Oxford West and Abingdon"]
, [16, 16, "Runnymede and Weybridge"]
, [17, 15, "Windsor"]
, [17, 13, "Esher and Walton"]
, [17, 11, "Mole Valley"]
, [18, 10, "Guildford"]
, [19, 11, "Epsom and Ewell"]
, [20, 10, "Reigate"]
, [21, 9, "Crawley"]
, [23, 9, "Arundel and South Downs"]
, [24, 10, "Horsham"]
, [25, 11, "Surrey East"]
, [26, 12, "Sevenoaks"]
, [27, 13, "Tonbridge and Malling"]
, [28, 14, "Dartford"]
, [29, 15, "Gravesham"]
, [30, 16, "Rochester and Strood"]
, [31, 15, "Sittingbourne and Sheppey"]
, [32, 14, "Canterbury"]
, [33, 13, "Thanet North"]
, [32, 12, "Thanet South"]
, [31, 11, "Dover"]
, [30, 10, "Folkestone and Hythe"]
, [29, 9, "Hastings and Rye"]
, [30, 14, "Chatham and Aylesford"]
, [31, 13, "Gillingham and Rainham"]
, [29, 13, "Maidstone and The Weald"]
, [30, 12, "Faversham and Kent Mid"]
, [29, 11, "Ashford"]
, [28, 12, "Tunbridge Wells"]
, [28, 10, "Bexhill and Battle"]
, [27, 11, "Wealden"]
, [26, 10, "Sussex Mid"]
, [19, 9, "Hampshire East"]
, [18, 8, "Portsmouth North"]
, [17, 7, "Meon Valley"]
, [17, 9, "Surrey South West"]
, [16, 8, "Winchester"]
, [16, 10, "Woking"]
, [16, 12, "Surrey Heath"]
, [16, 14, "Spelthorne"]
, [15, 15, "Maidenhead"]
, [15, 13, "Bracknell"]
, [14, 14, "Reading East"]
, [13, 15, "Wantage"]
, [13, 13, "Newbury"]
, [13, 11, "Hampshire North West"]
, [13, 9, "Romsey and Southampton North"]
, [13, 7, "New Forest East"]
, [14, 8, "Basingstoke"]
, [15, 9, "Aldershot"]
, [14, 10, "Wokingham"]
, [14, 12, "Reading West"]
, [15, 11, "Hampshire North East"]
, [30, 18, "Thurrock"]
, [31, 19, "Castle Point"]
, [31, 21, "Rochford and Southend East"]
, [31, 23, "Maldon"]
, [31, 25, "Clacton"]
, [31, 27, "Suffolk Coastal"]
, [30, 28, "Waveney"]
, [29, 29, "Great Yarmouth"]
, [28, 30, "Norfolk North"]
, [27, 29, "Norwich South"]
, [27, 31, "Broadland"]
, [26, 32, "Norfolk North West"]
, [25, 31, "Cambridgeshire North East"]
, [24, 30, "Hertfordshire North East"]
, [23, 31, "Peterborough"]
, [22, 32, "Norfolk Mid"]
, [21, 31, "Cambridgeshire North West"]
, [20, 30, "Huntingdon"]
, [19, 29, "Bedford"]
, [18, 28, "Bedfordshire North East"]
, [18, 26, "Luton North"]
, [19, 27, "Luton South"]
, [17, 25, "Bedfordshire Mid"]
, [17, 23, "Bedfordshire South West"]
, [18, 24, "Hertfordshire South West"]
, [19, 25, "Watford"]
, [20, 26, "Hertsmere"]
, [21, 27, "Welwyn Hatfield"]
, [22, 28, "St Albans"]
, [23, 27, "Broxbourne"]
, [24, 26, "Harlow"]
, [25, 27, "Cambridge"]
, [25, 25, "Epping Forest"]
, [26, 24, "Brentwood and Ongar"]
, [27, 23, "Saffron Walden"]
, [28, 24, "Colchester"]
, [28, 22, "Chelmsford"]
, [29, 21, "Basildon and Billericay"]
, [30, 20, "Basildon South and Thurrock East"]
, [20, 28, "Hitchin and Harpenden"]
, [21, 29, "Stevenage"]
, [22, 30, "Cambridgeshire South"]
, [23, 29, "Hemel Hempstead"]
, [24, 28, "Hertford and Stortford"]
, [25, 29, "Norfolk South West"]
, [26, 30, "Norwich North"]
, [26, 28, "Suffolk West"]
, [26, 26, "Cambridgeshire South East"]
, [27, 27, "Bury St Edmunds"]
, [28, 28, "Norfolk South"]
, [27, 25, "Braintree"]
, [28, 26, "Suffolk South"]
, [29, 27, "Ipswich"]
, [29, 25, "Harwich and Essex North"]
, [29, 23, "Rayleigh and Wickford"]
, [30, 22, "Southend West"]
, [30, 24, "Witham"]
, [30, 26, "Suffolk Central and Ipswich North"]
, [11, 39, "Newcastle-under-Lyme"]
, [12, 40, "Stoke-on-Trent North"]
, [13, 41, "Stoke-on-Trent Central"]
, [14, 42, "Staffordshire Moorlands"]
, [15, 41, "Stone"]
, [16, 42, "Burton"]
, [17, 41, "Tamworth"]
, [17, 39, "Warwickshire North"]
, [18, 42, "High Peak"]
, [19, 41, "Derbyshire North East"]
, [20, 40, "Chesterfield"]
, [21, 41, "Bolsover"]
, [22, 42, "Mansfield"]
, [23, 41, "Bassetlaw"]
, [24, 40, "Newark"]
, [25, 39, "Gainsborough"]
, [25, 37, "Louth and Horncastle"]
, [25, 35, "Boston and Skegness"]
, [25, 33, "South Holland and The Deepings"]
, [17, 37, "Nuneaton"]
, [17, 35, "Coventry North East"]
, [17, 33, "Coventry North West"]
, [16, 32, "Coventry South"]
, [16, 30, "Rugby"]
, [16, 28, "Warwick and Leamington"]
, [16, 26, "Northamptonshire South"]
, [12, 22, "Hereford and Herefordshire South"]
, [13, 23, "Worcestershire West"]
, [14, 24, "Worcestershire Mid"]
, [15, 25, "Stratford-on-Avon"]
, [15, 27, "Kenilworth and Southam"]
, [15, 29, "Solihull"]
, [12, 24, "Worcester"]
, [13, 25, "Redditch"]
, [14, 26, "Bromsgrove"]
, [14, 28, "Birmingham Hall Green"]
, [13, 27, "Birmingham Northfield"]
, [12, 26, "Birmingham Edgbaston"]
, [15, 31, "Birmingham Yardley"]
, [14, 30, "Birmingham Ladywood"]
, [13, 29, "Halesowen and Rowley Regis"]
, [12, 28, "Stourbridge"]
, [11, 27, "Herefordshire North"]
, [11, 29, "Wyre Forest"]
, [12, 30, "West Bromwich West"]
, [13, 31, "Birmingham Selly Oak"]
, [14, 32, "Birmingham Perry Barr"]
, [15, 33, "Birmingham Hodge Hill"]
, [16, 34, "Meriden"]
, [16, 36, "Sutton Coldfield"]
, [15, 35, "Birmingham Erdington"]
, [14, 34, "West Bromwich East"]
, [13, 33, "Warley"]
, [11, 31, "Ludlow"]
, [12, 32, "Dudley South"]
, [11, 33, "Wrekin, The"]
, [12, 34, "Dudley North"]
, [13, 35, "Wolverhampton South East"]
, [14, 36, "Walsall South"]
, [15, 37, "Cannock Chase"]
, [16, 38, "Aldridge-Brownhills"]
, [16, 40, "Lichfield"]
, [15, 39, "Stafford"]
, [14, 40, "Wolverhampton North East"]
, [14, 38, "Walsall North"]
, [13, 39, "Stoke-on-Trent South"]
, [12, 38, "Staffordshire South"]
, [13, 37, "Wolverhampton South West"]
, [11, 37, "Shropshire North"]
, [12, 36, "Telford"]
, [11, 35, "Shrewsbury and Atcham"]
, [17, 27, "Northampton South"]
, [17, 29, "Northampton North"]
, [17, 31, "Daventry"]
, [18, 30, "Wellingborough"]
, [19, 31, "Leicester South"]
, [19, 33, "Leicester West"]
, [20, 34, "Leicester East"]
, [18, 32, "Leicestershire South"]
, [18, 34, "Bosworth"]
, [20, 32, "Harborough"]
, [21, 33, "Kettering"]
, [21, 35, "Charnwood"]
, [22, 34, "Corby"]
, [23, 33, "Rutland and Melton"]
, [24, 32, "Grantham and Stamford"]
, [24, 34, "Sleaford and North Hykeham"]
, [24, 36, "Lincoln"]
, [24, 38, "Gedling"]
, [23, 39, "Nottingham North"]
, [22, 40, "Sherwood"]
, [23, 37, "Nottingham East"]
, [22, 38, "Broxtowe"]
, [21, 39, "Ashfield"]
, [23, 35, "Rushcliffe"]
, [22, 36, "Nottingham South"]
, [21, 37, "Erewash"]
, [20, 38, "Amber Valley"]
, [19, 39, "Derbyshire Mid"]
, [18, 40, "Derbyshire Dales"]
, [18, 38, "Derby North"]
, [19, 37, "Derby South"]
, [20, 36, "Loughborough"]
, [19, 35, "Leicestershire North West"]
, [18, 36, "Derbyshire South"]
, [29, 17, "Hornchurch and Upminster"]
, [29, 19, "Romford"]
, [28, 20, "Ilford South"]
, [28, 18, "Barking"]
, [28, 16, "Dagenham and Rainham"]
, [27, 15, "Erith and Thamesmead"]
, [27, 17, "Old Bexley and Sidcup"]
, [27, 19, "East Ham"]
, [27, 21, "Ilford North"]
, [26, 22, "Chingford and Woodford Green"]
, [26, 20, "West Ham"]
, [26, 18, "Greenwich and Woolwich"]
, [26, 16, "Eltham"]
, [26, 14, "Bexleyheath and Crayford"]
, [25, 13, "Orpington"]
, [25, 15, "Bromley and Chislehurst"]
, [25, 17, "Lewisham Deptford"]
, [25, 19, "Bethnal Green and Bow"]
, [25, 21, "Leyton and Wanstead"]
, [25, 23, "Edmonton"]
, [24, 24, "Enfield North"]
, [24, 22, "Walthamstow"]
, [24, 20, "Hackney South and Shoreditch"]
, [24, 18, "Poplar and Limehouse"]
, [24, 16, "Camberwell and Peckham"]
, [24, 14, "Lewisham East"]
, [24, 12, "Beckenham"]
, [23, 11, "Croydon Central"]
, [22, 10, "Croydon South"]
, [23, 13, "Lewisham West and Penge"]
, [23, 15, "Dulwich and West Norwood"]
, [23, 17, "Bermondsey and Old Southwark"]
, [23, 19, "Islington South and Finsbury"]
, [23, 21, "Hackney North and Stoke Newington"]
, [23, 23, "Tottenham"]
, [23, 25, "Enfield Southgate"]
, [22, 26, "Chipping Barnet"]
, [22, 24, "Finchley and Golders Green"]
, [22, 22, "Islington North"]
, [22, 20, "Holborn and St Pancras"]
, [22, 18, "Cities of London and Westminster"]
, [22, 16, "Vauxhall"]
, [22, 14, "Streatham"]
, [22, 12, "Croydon North"]
, [21, 11, "Carshalton and Wallington"]
, [21, 13, "Tooting"]
, [21, 15, "Battersea"]
, [21, 17, "Chelsea and Fulham"]
, [21, 19, "Westminster North"]
, [21, 21, "Hornsey and Wood Green"]
, [21, 23, "Brent Central"]
, [21, 25, "Hendon"]
, [20, 24, "Harrow East"]
, [20, 22, "Brent North"]
, [20, 20, "Hampstead and Kilburn"]
, [20, 18, "Kensington"]
, [20, 16, "Hammersmith"]
, [20, 14, "Wimbledon"]
, [20, 12, "Mitcham and Morden"]
, [19, 13, "Sutton and Cheam"]
, [19, 15, "Putney"]
, [19, 17, "Richmond Park"]
, [19, 19, "Brentford and Isleworth"]
, [19, 21, "Ealing Central and Acton"]
, [19, 23, "Harrow West"]
, [18, 22, "Ruislip, Northwood and Pinner"]
, [18, 20, "Ealing North"]
, [18, 18, "Ealing Southall"]
, [18, 16, "Feltham and Heston"]
, [18, 14, "Twickenham"]
, [18, 12, "Kingston and Surbiton"]
, [17, 17, "Hayes and Harlington"]
, [17, 19, "Uxbridge and Ruislip South"]
, [17, 43, "Hazel Grove"]
, [17, 45, "Stalybridge and Hyde"]
, [17, 47, "Oldham East and Saddleworth"]
, [17, 49, "Rochdale"]
, [17, 51, "Rossendale and Darwen"]
, [17, 53, "Burnley"]
, [17, 55, "Pendle"]
, [17, 57, "Ribble Valley"]
, [16, 58, "Lancaster and Fleetwood"]
, [15, 59, "Westmorland and Lonsdale"]
, [14, 60, "Carlisle"]
, [14, 62, "Penrith and The Border"]
, [13, 61, "Workington"]
, [13, 59, "Copeland"]
, [13, 57, "Barrow and Furness"]
, [12, 56, "Blackpool North and Cleveleys"]
, [11, 55, "Blackpool South"]
, [11, 53, "Fylde"]
, [11, 51, "Lancashire West"]
, [10, 50, "Ribble South"]
, [9, 49, "Southport"]
, [9, 47, "Sefton Central"]
, [9, 45, "Birkenhead"]
, [8, 44, "Bootle"]
, [8, 42, "Wallasey"]
, [8, 40, "Wirral West"]
, [13, 63, "Dumfriesshire, Clydesdale and Tweeddale"]
, [12, 64, "Rutherglen and Hamilton West"]
, [11, 63, "Dumfries and Galloway"]
, [10, 64, "Ayr, Carrick and Cumnock"]
, [9, 65, "Ayrshire Central"]
, [9, 67, "Ayrshire North and Arran"]
, [9, 69, "Paisley and Renfrewshire South"]
, [9, 71, "Glasgow South West"]
, [8, 72, "Inverclyde"]
, [9, 73, "Glasgow North West"]
, [9, 75, "Paisley and Renfrewshire North"]
, [9, 77, "Argyll and Bute"]
, [10, 78, "Stirling"]
, [10, 80, "Ross, Skye and Lochaber"]
, [10, 82, "Caithness, Sutherland and Easter Ross"]
, [11, 79, "Inverness, Nairn, Badenoch and Strathspey"]
, [12, 80, "Gordon"]
, [13, 81, "Banff and Buchan"]
, [14, 80, "Aberdeen North"]
, [15, 79, "Aberdeen South"]
, [14, 78, "Angus"]
, [14, 76, "Dundee West"]
, [15, 75, "Fife North East"]
, [14, 74, "Glenrothes"]
, [13, 73, "Kirkcaldy and Cowdenbeath"]
, [13, 71, "Edinburgh West"]
, [14, 70, "Edinburgh East"]
, [15, 69, "East Lothian"]
, [14, 68, "Edinburgh North and Leith"]
, [14, 66, "Berwickshire, Roxburgh and Selkirk"]
, [15, 65, "Berwick-upon-Tweed"]
, [16, 66, "Wansbeck"]
, [17, 65, "Blyth Valley"]
, [18, 66, "Tynemouth"]
, [19, 65, "South Shields"]
, [20, 64, "Sunderland Central"]
, [20, 62, "Easington"]
, [21, 61, "Hartlepool"]
, [22, 60, "Redcar"]
, [22, 58, "Middlesbrough South and Cleveland East"]
, [21, 57, "Stockton South"]
, [20, 58, "Darlington"]
, [19, 59, "Sedgefield"]
, [18, 58, "Bishop Auckland"]
, [14, 64, "Midlothian"]
, [13, 85, "Orkney and Shetland"]
, [8, 80, "Na H-Eileanan An Iar"]
, [22, 56, "Harrogate and Knaresborough"]
, [23, 55, "Scarborough and Whitby"]
, [23, 53, "York Outer"]
, [25, 51, "Yorkshire East"]
, [25, 49, "Beverley and Holderness"]
, [24, 48, "Hull North"]
, [24, 46, "Hull East"]
, [24, 44, "Hull West and Hessle"]
, [25, 43, "Great Grimsby"]
, [25, 41, "Cleethorpes"]
, [24, 50, "Haltemprice and Howden"]
, [23, 51, "Hemsworth"]
, [21, 59, "Middlesbrough"]
, [20, 60, "Stockton North"]
, [19, 61, "Houghton and Sunderland South"]
, [19, 63, "Washington and Sunderland West"]
, [18, 64, "Jarrow"]
, [18, 62, "Gateshead"]
, [18, 60, "Durham, City of"]
, [17, 63, "Tyneside North"]
, [17, 61, "Newcastle upon Tyne East"]
, [17, 59, "Durham North"]
, [16, 60, "Durham North West"]
, [16, 62, "Newcastle upon Tyne Central"]
, [16, 64, "Newcastle upon Tyne North"]
, [15, 63, "Hexham"]
, [15, 61, "Blaydon"]
, [13, 79, "Aberdeenshire West and Kincardine"]
, [12, 78, "Moray"]
, [13, 77, "Dundee East"]
, [13, 75, "Dunfermline and West Fife"]
, [12, 74, "Falkirk"]
, [12, 76, "Ochil and South Perthshire"]
, [11, 77, "Perth and North Perthshire"]
, [10, 76, "Dunbartonshire West"]
, [11, 75, "Cumbernauld, Kilsyth and Kirkintilloch East"]
, [10, 74, "Dunbartonshire East"]
, [11, 73, "Glasgow North East"]
, [12, 72, "Linlithgow and Falkirk East"]
, [13, 69, "Edinburgh South West"]
, [13, 67, "Edinburgh South"]
, [13, 65, "Livingston"]
, [12, 66, "Lanark and Hamilton East"]
, [12, 68, "Motherwell and Wishaw"]
, [12, 70, "Airdrie and Shotts"]
, [11, 71, "Glasgow East"]
, [11, 69, "Coatbridge, Chryston and Bellshill"]
, [11, 67, "Glasgow South"]
, [11, 65, "Kilmarnock and Loudoun"]
, [10, 66, "East Kilbride, Strathaven and Lesmahagow"]
, [10, 68, "Renfrewshire East"]
, [10, 70, "Glasgow Central"]
, [10, 72, "Glasgow North"]
, [22, 54, "Selby and Ainsty"]
, [21, 55, "Elmet and Rothwell"]
, [20, 56, "Shipley"]
, [19, 57, "Richmond (Yorks)"]
, [22, 52, "York Central"]
, [21, 53, "Normanton, Pontefract and Castleford"]
, [20, 54, "Leeds West"]
, [19, 55, "Pudsey"]
, [18, 56, "Skipton and Ripon"]
, [18, 54, "Keighley"]
, [19, 53, "Bradford East"]
, [20, 52, "Leeds North West"]
, [21, 51, "Leeds North East"]
, [22, 50, "Leeds East"]
, [23, 49, "Doncaster North"]
, [23, 47, "Doncaster Central"]
, [23, 45, "Brigg and Goole"]
, [24, 42, "Scunthorpe"]
, [23, 43, "Rother Valley"]
, [22, 44, "Sheffield South East"]
, [21, 43, "Sheffield Heeley"]
, [20, 42, "Sheffield Hallam"]
, [19, 43, "Penistone and Stocksbridge"]
, [20, 44, "Sheffield Central"]
, [21, 45, "Sheffield Brightside and Hillsborough"]
, [22, 46, "Don Valley"]
, [22, 48, "Wentworth and Dearne"]
, [21, 47, "Rotherham"]
, [21, 49, "Morley and Outwood"]
, [20, 50, "Wakefield"]
, [20, 48, "Dewsbury"]
, [20, 46, "Barnsley East"]
, [19, 45, "Barnsley Central"]
, [18, 44, "Colne Valley"]
, [18, 46, "Calder Valley"]
, [19, 47, "Huddersfield"]
, [19, 49, "Batley and Spen"]
, [19, 51, "Leeds Central"]
, [18, 52, "Bradford West"]
, [18, 50, "Bradford South"]
, [18, 48, "Halifax"]
, [14, 58, "Morecambe and Lunesdale"]
, [15, 57, "Wyre and Preston North"]
, [16, 56, "Hyndburn"]
, [16, 54, "Heywood and Middleton"]
, [15, 55, "Bury North"]
, [14, 56, "Blackburn"]
, [13, 55, "Preston"]
, [14, 54, "Bolton North East"]
, [15, 53, "Bury South"]
, [16, 52, "Oldham West and Royton"]
, [16, 50, "Ashton under Lyne"]
, [16, 48, "Denton and Reddish"]
, [16, 46, "Stockport"]
, [16, 44, "Macclesfield"]
, [15, 43, "Congleton"]
, [15, 45, "Cheadle"]
, [15, 47, "Manchester Withington"]
, [15, 49, "Manchester Central"]
, [15, 51, "Blackley and Broughton"]
, [14, 52, "Bolton South East"]
, [12, 54, "Chorley"]
, [13, 53, "Bolton West"]
, [12, 52, "Wigan"]
, [13, 51, "Stretford and Urmston"]
, [14, 50, "Salford and Eccles"]
, [14, 48, "Wythenshawe and Sale East"]
, [13, 49, "Manchester Gorton"]
, [12, 50, "Makerfield"]
, [14, 46, "Altrincham and Sale West"]
, [14, 44, "Tatton"]
, [13, 43, "Crewe and Nantwich"]
, [13, 45, "Warrington South"]
, [13, 47, "Worsley and Eccles South"]
, [12, 48, "Leigh"]
, [11, 49, "St Helens North"]
, [12, 42, "Weaver Vale"]
, [12, 44, "Halton"]
, [12, 46, "Warrington North"]
, [11, 41, "Eddisbury"]
, [11, 43, "Garston and Halewood"]
, [11, 45, "St Helens South and Whiston"]
, [11, 47, "Knowsley"]
, [10, 48, "Liverpool Walton"]
, [10, 46, "Liverpool West Derby"]
, [10, 44, "Liverpool Wavertree"]
, [10, 42, "Liverpool Riverside"]
, [9, 41, "Wirral South"]
, [9, 43, "Ellesmere Port and Neston"]
, [10, 40, "Chester, City of"]
, [24, 52, "Thirsk and Malton"]
, [0, 50, "Strangford"]
, [0, 52, "Down North"]
, [-1, 49, "Down South"]
, [-1, 51, "Lagan Valley"]
, [-1, 53, "Belfast East"]
, [-2, 50, "Upper Bann"]
, [-2, 52, "Belfast South"]
, [-3, 51, "Newry and Armagh"]
, [-1, 55, "Belfast North"]
, [0, 56, "Antrim East"]
, [-1, 57, "Antrim North"]
, [-2, 58, "Londonderry East"]
, [-2, 56, "Antrim South"]
, [-3, 57, "Foyle"]
, [-4, 56, "Tyrone West"]
, [-3, 55, "Ulster Mid"]
, [-2, 54, "Belfast West"]
, [-4, 54, "Fermanagh and South Tyrone"]
];
